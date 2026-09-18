#include "domain/InstallStateStore.h"
#include "domain/InstallRecordJson.h"

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

using namespace InstallJson;


bool InstallStateStore::save() const
{
    if (m_filePath.isEmpty()) return false;
    QDir().mkpath(QFileInfo(m_filePath).absolutePath());

    QJsonObject modules;
    for (auto it = m_records.cbegin(); it != m_records.cend(); ++it)
        modules[it.key()] = toJson(it.value());
    QJsonObject root;
    root["format"] = 1;
    root["modules"] = modules;

    QSaveFile f(m_filePath);
    if (!f.open(QIODevice::WriteOnly)) return false;
    f.write(QJsonDocument(root).toJson(QJsonDocument::Indented));
    return f.commit();
}

} // namespace Hypernucleus
