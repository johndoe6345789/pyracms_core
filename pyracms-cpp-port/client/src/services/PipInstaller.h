#pragma once

#include <QObject>
#include <QStringList>

#include "services/ProcessRunner.h"
#include "services/PythonLocator.h"

namespace Hypernucleus {

class PathManager;

// Gives each game its own virtual environment,
// `python -m venv <data>/pylibs/<game>/venv`, and runs `pip install` with
// that environment's interpreter. Requirements come from the manifest, from
// pip-first dependency names and from a requirements.txt inside the game
// archive. An old `pip --target` folder is cleaned up when the venv is made.
class PipInstaller : public QObject {
    Q_OBJECT
    Q_PROPERTY(bool busy READ isBusy NOTIFY busyChanged)

public:
    explicit PipInstaller(PathManager* paths, QObject* parent = nullptr);

    bool isBusy() const;
    void setPythonPath(const QString& path) { m_pythonPath = path; }
    QString pythonPath() const { return m_pythonPath; }
    // Replaces the process launcher (tests); not owned.
    void setRunner(ProcessRunner* runner);

    // `gameDir` is scanned for requirements.txt. Emits finished() right away
    // when there is nothing to install.
    void install(const QString& gameName, const QString& gameDir,
                 const QStringList& specs);
    void cancel();

    // Plain "name[extras] [op version[, op version]]" only: no URLs, paths
    // or options can be smuggled in through a manifest.
    static bool isValidSpec(const QString& spec);

    // Arguments after the venv interpreter / after the base interpreter.
    static QStringList buildArguments(const QString& requirementsFile,
                                      const QStringList& specs);
    static QStringList venvArguments(const QString& venvDir);

signals:
    void busyChanged();
    void started(const QString& name);
    void output(const QString& name, const QString& text);
    void finished(const QString& name);
    void failed(const QString& name, const QString& error);
    void cancelled(const QString& name);
    // No interpreter found: the UI can offer the managed Python download.
    void pythonMissing(const QString& name);

private:
    enum class Stage { Idle, Venv, Pip };

    void setBusy(bool busy);
    void createVenv(const PythonInfo& py);
    void runPip();
    void onResult(const ProcessResult& result);
    void end();

    PathManager* m_paths;
    ProcessRunner* m_runner = nullptr;
    QString m_pythonPath;
    QString m_name;
    QString m_workDir;
    QStringList m_pipArgs;
    Stage m_stage = Stage::Idle;
    bool m_busy = false;
};

} // namespace Hypernucleus
