#pragma once

#include "domain/GameEntry.h"

#include <QJsonObject>

namespace Hypernucleus {

// What to actually download for one revision on this machine.
struct DownloadTarget {
    bool ok = false;
    QString error;
    QString fileRef;
    QString url;
    qint64 size = 0;
    QString sha256;
    QString executable;
    QString moduleType;      // "file" | "folder" (python layout)
    bool nativeBuild = false; // true: OS-specific binary, false: python source
    QString version;

    QJsonObject toJson() const;
    static DownloadTarget fromJson(const QJsonObject& o);
};

namespace BinarySelector {

QString normalizeOs(const QString& os);
QString normalizeArch(const QString& arch);
// "pi", "any", "all", "*" and empty mean platform independent.
bool isPlatformIndependent(const QString& value);

// Best matching binary, or nullptr. Exact OS/arch beat platform-independent.
const BinaryInfo* pickBinary(const QList<BinaryInfo>& binaries,
                             const QString& os, const QString& arch);

// type is "game" or "dep". Games use an OS-specific binary when one matches
// and otherwise the revision's python source archive (original Hypernucleus
// behaviour). Dependencies use a matching binary (incl. "pi") or the source.
DownloadTarget resolveTarget(const RevisionInfo& rev, const QString& type,
                             const QString& os, const QString& arch);

} // namespace BinarySelector
} // namespace Hypernucleus
