#pragma once

#include <QMetaType>
#include <QObject>
#include <QProcessEnvironment>
#include <QString>
#include <QStringList>

class QProcess;

namespace Hypernucleus {

struct ProcessResult {
    bool started = false;   // false: the program could not be launched
    int exitCode = -1;
    bool cancelled = false; // stopped through cancel()
    QString output;         // last part of stdout + stderr

    bool ok() const { return started && !cancelled && exitCode == 0; }
};

// Runs one external program at a time (python, tar, ...). The interface lets
// tests script the outcome instead of launching real processes.
class ProcessRunner : public QObject {
    Q_OBJECT

public:
    using QObject::QObject;
    virtual void start(const QString& program, const QStringList& args,
                       const QString& workDir,
                       const QProcessEnvironment& env) = 0;
    virtual void cancel() = 0;
    virtual bool isRunning() const = 0;

signals:
    void output(const QString& text);
    void finished(const Hypernucleus::ProcessResult& result);
};

// The real thing: a QProcess with merged stdout / stderr.
class QProcessRunner : public ProcessRunner {
    Q_OBJECT

public:
    using ProcessRunner::ProcessRunner;
    void start(const QString& program, const QStringList& args,
               const QString& workDir,
               const QProcessEnvironment& env) override;
    void cancel() override;
    bool isRunning() const override;

private:
    void finish(bool started, int code);

    QProcess* m_process = nullptr;
    QString m_tail;
    bool m_cancelled = false;
};

} // namespace Hypernucleus

Q_DECLARE_METATYPE(Hypernucleus::ProcessResult)
