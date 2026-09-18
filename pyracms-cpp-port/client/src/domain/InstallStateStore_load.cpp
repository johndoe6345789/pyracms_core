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


bool InstallStateStore::load()
{
    m_records.clear();
    if (m_filePath.isEmpty() || !QFileInfo::exists(m_filePath)) return true;

    QFile f(m_filePath);
    bool ok = f.open(QIODevice::ReadOnly);
    QJsonParseError err{};
    QJsonDocument doc;
    if (ok) {
        doc = QJsonDocument::fromJson(f.readAll(), &err);
        ok = err.error == QJsonParseError::NoError && doc.isObject();
        f.close();
    }
    if (!ok) {
        QFile::remove(m_filePath + ".corrupt");
        QFile::rename(m_filePath, m_filePath + ".corrupt");
        return false;
    }

    const QJsonObject modules = doc.object().value("modules").toObject();
    for (auto it = modules.begin(); it != modules.end(); ++it) {
        InstallRecord r = fromJson(it.value().toObject());
        if (r.name.isEmpty()) r.name = it.key();
        if (r.isValid()) m_records.insert(r.name, r);
    }
    return true;
}

} // namespace Hypernucleus
