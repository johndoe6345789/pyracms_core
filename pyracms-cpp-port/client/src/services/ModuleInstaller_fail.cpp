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

void ModuleInstaller::fail(const QString& name, const QString& error)
{
    m_hasJob = false;
    setBusy(false);
    emit installFailed(name, error);
}

} // namespace Hypernucleus
