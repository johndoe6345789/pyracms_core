#include "services/ModuleInstaller.h"
#include "services/ApiClient.h"
#include "services/ArchiveExtractor.h"
#include "services/DownloadManager.h"
#include "services/PathManager.h"

#include <QDir>
#include <QFile>
#include <QFileInfo>
#include <QRegularExpression>
#include <QUrl>
#include <functional>

namespace Hypernucleus {

bool ModuleInstaller::removeDirectory(const QString& path)
{
    QDir dir(path);
    if (!dir.exists()) return true;
    return dir.removeRecursively();
}

} // namespace Hypernucleus
