#include "services/PipInstaller.h"
#include "services/PathManager.h"
#include "services/PythonLocator.h"

#include <QDir>
#include <QFileInfo>
#include <QProcessEnvironment>
#include <QTimer>

namespace Hypernucleus {

void PipInstaller::install(const QString& gameName, const QString& gameDir,
                           const QStringList& specs)
{
    if (m_busy) {
        emit failed(gameName, tr("pip is already running"));
        return;
    }
    QString requirements = gameDir + "/requirements.txt";
    if (!QFileInfo::exists(requirements)) requirements.clear();
    QStringList cleanSpecs;
    for (const QString& s : specs)
        if (isValidSpec(s)) cleanSpecs << s.trimmed();

    if (requirements.isEmpty() && cleanSpecs.isEmpty()) {
        QTimer::singleShot(0, this,
                           [this, gameName]() { emit finished(gameName); });
        return;
    }
    const PythonInfo py = PythonLocator::find(m_pythonPath, m_paths->dataDir());
    if (!py.found()) {
        emit pythonMissing(gameName);
        emit failed(gameName,
                    tr("Python was not found. Install Python 3 or set its "
                       "location in Settings to install pip packages."));
        return;
    }
    m_name = gameName;
    m_workDir = gameDir;
    m_pipArgs = buildArguments(requirements, cleanSpecs);
    setBusy(true);
    emit started(gameName);
    if (QFileInfo::exists(m_paths->venvPython(gameName)))
        runPip();
    else
        createVenv(py);
}

void PipInstaller::createVenv(const PythonInfo& py)
{
    m_paths->cleanLegacyTarget(m_name); // old `pip --target` content
    QDir().mkpath(m_paths->pipTargetDir(m_name));
    m_stage = Stage::Venv;
    m_runner->start(py.exe, py.prefix + venvArguments(m_paths->venvDir(m_name)),
                    m_workDir, QProcessEnvironment::systemEnvironment());
}

void PipInstaller::runPip()
{
    m_stage = Stage::Pip;
    QProcessEnvironment env = QProcessEnvironment::systemEnvironment();
    env.insert("PIP_DISABLE_PIP_VERSION_CHECK", "1");
    env.insert("PYTHONUNBUFFERED", "1");
    m_runner->start(m_paths->venvPython(m_name), m_pipArgs, m_workDir, env);
}

} // namespace Hypernucleus
