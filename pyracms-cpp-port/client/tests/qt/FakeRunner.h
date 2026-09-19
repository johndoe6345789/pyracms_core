#pragma once

#include <QFile>
#include <QFileInfo>
#include <QDir>
#include <QTimer>
#include <functional>

#include "services/ProcessRunner.h"

// Scripted ProcessRunner: records every call, answers with `exitCode` and
// lets a test run a side effect (e.g. create the venv) before answering.
struct FakeRunner : Hypernucleus::ProcessRunner {
    struct Call {
        QString program;
        QStringList args;
    };
    QList<Call> calls;
    int exitCode = 0;
    bool startFails = false;
    QString text;
    std::function<void(const Call&)> effect;
    bool running = false;

    void start(const QString& program, const QStringList& args, const QString&,
               const QProcessEnvironment&) override
    {
        const Call c{program, args};
        calls << c;
        running = true;
        if (effect) effect(c);
        QTimer::singleShot(0, this, [this]() {
            running = false;
            Hypernucleus::ProcessResult r;
            r.started = !startFails;
            r.exitCode = exitCode;
            r.output = text;
            if (!text.isEmpty()) emit output(text);
            emit finished(r);
        });
    }
    void cancel() override
    {
        running = false;
        Hypernucleus::ProcessResult r;
        r.started = true;
        r.cancelled = true;
        emit finished(r);
    }
    bool isRunning() const override { return running; }
};

// Creates an empty file (and its folders).
inline void touch(const QString& path)
{
    QDir().mkpath(QFileInfo(path).absolutePath());
    QFile f(path);
    f.open(QIODevice::WriteOnly);
}
