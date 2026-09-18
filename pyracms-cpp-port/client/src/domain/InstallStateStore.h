#pragma once

#include <QMap>
#include <QString>
#include <QStringList>

namespace Hypernucleus {

// Everything the launcher must remember about one installed module so that
// it can start (and uninstall) it later without asking the server.
struct InstallRecord {
    QString name;
    QString version;
    QString type;            // "game" | "dep"
    QString path;            // install directory
    QString moduleType;      // python layout: "file" | "folder"
    QString kind;            // "python" | "native"
    QString executable;      // native entry point (relative), optional
    QStringList deps;        // names of PyraCMS dependency modules
    QStringList pipSpecs;    // pip requirements installed for this module
    QString installedAt;     // ISO-8601 UTC
    qint64 sizeBytes = 0;

    bool isValid() const { return !name.isEmpty() && !version.isEmpty(); }
};

// Plain JSON-file backed store (installed.json). Not a QObject on purpose:
// it is trivially unit-testable and owners emit their own change signals.
class InstallStateStore {
public:
    explicit InstallStateStore(const QString& filePath = QString());

    QString filePath() const { return m_filePath; }
    void setFilePath(const QString& path) { m_filePath = path; }

    // Returns false if the file exists but is unreadable / corrupt. A corrupt
    // file is moved aside to "<file>.corrupt" and the store starts empty.
    bool load();
    // Atomic write (QSaveFile).
    bool save() const;

    void set(const InstallRecord& record);
    bool remove(const QString& name);
    bool contains(const QString& name) const;
    InstallRecord get(const QString& name) const;
    QString version(const QString& name) const;
    QStringList names() const;
    QMap<QString, QString> versions() const;
    int count() const { return m_records.size(); }
    void clear() { m_records.clear(); }

    // Import "[Installed Version]" from the original Hypernucleus config.ini
    // (name = version). Only modules whose folder still exists are imported.
    // Returns the number of imported modules.
    int importLegacyIni(const QString& iniPath, const QString& gamesDir,
                        const QString& depsDir);

private:
    QString m_filePath;
    QMap<QString, InstallRecord> m_records;
};

} // namespace Hypernucleus
