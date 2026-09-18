#include "services/PipInstaller.h"
#include "services/PathManager.h"
#include "services/PythonLocator.h"

#include <QDir>
#include <QFileInfo>
#include <QTimer>

namespace Hypernucleus {

void PipInstaller::install(const QString& gameName, const QString& gameDir,
                           const QStringList& specs)
{
    if (m_busy) {
        emit failed(gameName, "pip is already running");
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
        emit failed(gameName,
                    "Python was not found. Install Python 3 or set its "
                    "location in Settings to install pip packages.");
        return;
    }

    const QString target = m_paths->pipTargetDir(gameName);
    QDir().mkpath(target);
    m_name = gameName;
    m_tail.clear();
    m_cancelled = false;
    setBusy(true);
    emit started(gameName);
    startProcess(py, buildArguments(target, requirements, cleanSpecs),
                 gameDir);
}

} // namespace Hypernucleus
