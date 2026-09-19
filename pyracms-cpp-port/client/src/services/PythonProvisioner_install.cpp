#include "services/PythonProvisioner.h"
#include "services/ArchiveExtractor.h"
#include "services/DownloadManager.h"
#include "services/PathManager.h"
#include "services/PythonLocator.h"

#include <QDir>
#include <QFile>
#include <QProcessEnvironment>
#include <QStandardPaths>

namespace Hypernucleus {

QString PythonProvisioner::tarProgram()
{
#ifdef Q_OS_WIN
    const QString sys =
        qEnvironmentVariable("SystemRoot") + "/System32/tar.exe";
    if (QFile::exists(sys)) return sys;
#endif
    const QString found = QStandardPaths::findExecutable("tar");
    return found.isEmpty() ? QStringLiteral("tar") : found;
}

void PythonProvisioner::accept()
{
    if (m_state != State::Offered) return;
    setState(State::Downloading);
    DownloadManager::Request req;
    req.id = "managed-python";
    req.url = QUrl(m_asset.url);
    req.destPath = m_paths->archivePath(m_asset.name);
    req.expectedSize = m_asset.size;
    req.expectedSha256 = m_asset.sha256;
    m_downloads->start(req);
}

} // namespace Hypernucleus
