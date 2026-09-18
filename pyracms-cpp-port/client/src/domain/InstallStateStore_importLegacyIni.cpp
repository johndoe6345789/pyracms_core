#include "domain/InstallStateStore.h"

#include <QDateTime>
#include <QDir>
#include <QFile>
#include <QFileInfo>
#include <QJsonArray>
#include <QJsonDocument>
#include <QJsonObject>
#include <QSaveFile>
#include <QSettings>

namespace Hypernucleus {

int InstallStateStore::importLegacyIni(const QString& iniPath,
                                       const QString& gamesDir,
                                       const QString& depsDir)
{
    if (!QFileInfo::exists(iniPath)) return 0;
    QSettings ini(iniPath, QSettings::IniFormat);
    ini.beginGroup("Installed Version");
    int imported = 0;
    const QStringList keys = ini.childKeys();
    for (const QString& key : keys) {
        if (m_records.contains(key)) continue;
        InstallRecord r;
        r.name = key;
        r.version = ini.value(key).toString();
        if (QDir(gamesDir + "/" + key).exists()) {
            r.type = "game";
            r.path = gamesDir + "/" + key;
        } else if (QDir(depsDir + "/" + key).exists()) {
            r.type = "dep";
            r.path = depsDir + "/" + key;
        } else {
            continue;
        }
        r.moduleType.clear(); // unknown: launcher adds both python path forms
        r.kind = "python";
        if (r.isValid()) {
            set(r);
            ++imported;
        }
    }
    ini.endGroup();
    return imported;
}

} // namespace Hypernucleus
