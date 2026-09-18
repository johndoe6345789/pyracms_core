#pragma once

#include <QObject>
#include <QStringList>

#include "services/PythonLocator.h"

class QProcess;

namespace Hypernucleus {

class PathManager;

// `python -m pip install --target <data>/pylibs/<game>` for one game.
// Requirements come from the manifest, from pip-first dependency names and
// from a requirements.txt shipped inside the game archive.
class PipInstaller : public QObject {
    Q_OBJECT
    Q_PROPERTY(bool busy READ isBusy NOTIFY busyChanged)

public:
    explicit PipInstaller(PathManager* paths, QObject* parent = nullptr);

    bool isBusy() const;
    void setPythonPath(const QString& path) { m_pythonPath = path; }
    QString pythonPath() const { return m_pythonPath; }

    // `gameDir` is scanned for requirements.txt. Emits finished() right away
    // when there is nothing to install.
    void install(const QString& gameName, const QString& gameDir,
                 const QStringList& specs);
    void cancel();

    // Plain "name[extras] [op version[, op version]]" only: no URLs, paths
    // or options can be smuggled in through a manifest.
    static bool isValidSpec(const QString& spec);

    // Arguments after the interpreter, exposed for tests.
    static QStringList buildArguments(const QString& targetDir,
                                      const QString& requirementsFile,
                                      const QStringList& specs);

signals:
    void busyChanged();
    void started(const QString& name);
    void output(const QString& name, const QString& text);
    void finished(const QString& name);
    void failed(const QString& name, const QString& error);
    void cancelled(const QString& name);

private:
    void setBusy(bool busy);
    void startProcess(const PythonInfo& py, const QStringList& args,
                      const QString& workDir);
    void connectProcess();

    PathManager* m_paths;
    QString m_pythonPath;
    QProcess* m_process = nullptr;
    QString m_name;
    QString m_tail;
    bool m_busy = false;
    bool m_cancelled = false;
};

} // namespace Hypernucleus
