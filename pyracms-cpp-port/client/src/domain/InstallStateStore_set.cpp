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

void InstallStateStore::set(const InstallRecord& record)
{
    InstallRecord r = record;
    if (r.installedAt.isEmpty())
        r.installedAt = QDateTime::currentDateTimeUtc().toString(Qt::ISODate);
    m_records.insert(r.name, r);
}

bool InstallStateStore::remove(const QString& name)
{
    return m_records.remove(name) > 0;
}

bool InstallStateStore::contains(const QString& name) const
{
    return m_records.contains(name);
}

InstallRecord InstallStateStore::get(const QString& name) const
{
    return m_records.value(name);
}

QString InstallStateStore::version(const QString& name) const
{
    return m_records.value(name).version;
}

QStringList InstallStateStore::names() const { return m_records.keys(); }

QMap<QString, QString> InstallStateStore::versions() const
{
    QMap<QString, QString> out;
    for (auto it = m_records.cbegin(); it != m_records.cend(); ++it)
        out.insert(it.key(), it.value().version);
    return out;
}

} // namespace Hypernucleus
