#pragma once

#include <QJsonObject>
#include <QList>
#include <QString>
#include <QStringList>

namespace Hypernucleus {

// One downloadable build of a revision for a given OS / architecture.
// Original Hypernucleus used os="pi" arch="pi" for platform-independent
// (pure python) builds; empty / "any" / "all" are accepted as well.
struct BinaryInfo {
    QString os;
    QString arch;
    QString fileRef;      // uuid or numeric file id (resolved via /api/files)
    QString url;          // absolute or server-relative download URL
    qint64 size = 0;      // bytes, 0 = unknown
    QString sha256;       // lowercase hex, empty = unknown
    QString executable;   // optional entry point relative to install dir
};

struct RevisionInfo {
    QString version;
    QString moduleType;   // "file" | "folder" (python module layout)
    QString fileRef;      // source archive
    QString url;
    QString createdAt;
    bool published = true;
    qint64 size = 0;
    QString sha256;
    QString executable;
    QList<BinaryInfo> binaries;
};

struct DepRef {
    QString name;
    QString version;      // empty = latest
    QString source;       // "", "pip" or "pyracms" (explicit override)
};

struct GameEntry {
    QString name;
    QString displayName;
    QString description;
    QString type;         // "game" | "dep"
    QString hero;         // banner ref/url, may be empty
    QStringList tags;
    QStringList screenshots;          // refs or urls
    QList<RevisionInfo> revisions;
    QList<DepRef> dependencies;       // PyraCMS dependency pages
    QStringList pipRequirements;      // explicit pip specifiers
    int likes = 0;
    int dislikes = 0;
    int views = 0;
    QString createdAt;
    bool detailLoaded = false;

    QString title() const { return displayName.isEmpty() ? name : displayName; }
    QString latestVersion() const;
    const RevisionInfo* revision(const QString& version) const;
};

} // namespace Hypernucleus
