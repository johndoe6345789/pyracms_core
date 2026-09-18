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

namespace {

QJsonArray toArray(const QStringList& list)
{
    QJsonArray a;
    for (const QString& s : list)
        a.append(s);
    return a;
}

QStringList toList(const QJsonValue& v)
{
    QStringList l;
    const QJsonArray arr = v.toArray();
    for (const QJsonValue& e : arr)
        l.append(e.toString());
    return l;
}

QJsonObject toJson(const InstallRecord& r)
{
    QJsonObject o;
    o["name"] = r.name;
    o["version"] = r.version;
    o["type"] = r.type;
    o["path"] = r.path;
    o["moduleType"] = r.moduleType;
    o["kind"] = r.kind;
    o["executable"] = r.executable;
    o["deps"] = toArray(r.deps);
    o["pipSpecs"] = toArray(r.pipSpecs);
    o["installedAt"] = r.installedAt;
    o["sizeBytes"] = static_cast<double>(r.sizeBytes);
    return o;
}

InstallRecord fromJson(const QJsonObject& o)
{
    InstallRecord r;
    r.name = o.value("name").toString();
    r.version = o.value("version").toString();
    r.type = o.value("type").toString("game");
    r.path = o.value("path").toString();
    r.moduleType = o.value("moduleType").toString();
    r.kind = o.value("kind").toString("python");
    r.executable = o.value("executable").toString();
    r.deps = toList(o.value("deps"));
    r.pipSpecs = toList(o.value("pipSpecs"));
    r.installedAt = o.value("installedAt").toString();
    r.sizeBytes = static_cast<qint64>(o.value("sizeBytes").toDouble());
    return r;
}

} // namespace

InstallStateStore::InstallStateStore(const QString& filePath)
    : m_filePath(filePath)
{
}

bool InstallStateStore::load()
{
    m_records.clear();
    if (m_filePath.isEmpty() || !QFileInfo::exists(m_filePath))
        return true;

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
        if (r.name.isEmpty())
            r.name = it.key();
        if (r.isValid())
            m_records.insert(r.name, r);
    }
    return true;
}

bool InstallStateStore::save() const
{
    if (m_filePath.isEmpty())
        return false;
    QDir().mkpath(QFileInfo(m_filePath).absolutePath());

    QJsonObject modules;
    for (auto it = m_records.cbegin(); it != m_records.cend(); ++it)
        modules[it.key()] = toJson(it.value());
    QJsonObject root;
    root["format"] = 1;
    root["modules"] = modules;

    QSaveFile f(m_filePath);
    if (!f.open(QIODevice::WriteOnly))
        return false;
    f.write(QJsonDocument(root).toJson(QJsonDocument::Indented));
    return f.commit();
}

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

QStringList InstallStateStore::names() const
{
    return m_records.keys();
}

QMap<QString, QString> InstallStateStore::versions() const
{
    QMap<QString, QString> out;
    for (auto it = m_records.cbegin(); it != m_records.cend(); ++it)
        out.insert(it.key(), it.value().version);
    return out;
}

int InstallStateStore::importLegacyIni(const QString& iniPath,
                                       const QString& gamesDir,
                                       const QString& depsDir)
{
    if (!QFileInfo::exists(iniPath))
        return 0;
    QSettings ini(iniPath, QSettings::IniFormat);
    ini.beginGroup("Installed Version");
    int imported = 0;
    const QStringList keys = ini.childKeys();
    for (const QString& key : keys) {
        if (m_records.contains(key))
            continue;
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
