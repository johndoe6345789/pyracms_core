#pragma once

#include "domain/BinarySelector.h"

#include <QString>

namespace Hypernucleus {

// The single install ModuleInstaller is working on.
struct InstallJob {
    QString name;
    QString version;
    QString type;
    DownloadTarget target;
    QString archivePath;
};

} // namespace Hypernucleus
