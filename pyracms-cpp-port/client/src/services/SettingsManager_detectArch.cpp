#include "services/SettingsManager.h"

#include <QSettings>
#include <QSysInfo>

namespace Hypernucleus {

QString SettingsBase::detectArch()
{
    QString cpu = QSysInfo::currentCpuArchitecture();
    if (cpu == "x86_64" || cpu == "amd64")
        return "x86_64";
    else if (cpu == "arm64" || cpu == "aarch64")
        return "arm64";
    else if (cpu == "i386" || cpu == "x86")
        return "x86";
    return cpu;
}

} // namespace Hypernucleus
