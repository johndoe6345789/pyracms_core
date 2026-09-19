#include "domain/LaunchResolver.h"

#include <QDir>
#include <QFileInfo>
#include <QSet>

namespace Hypernucleus {
namespace LaunchResolver {

bool isInside(const QString& base, const QString& path)
{
    const QString b = QFileInfo(QDir::cleanPath(base)).absoluteFilePath();
    const QString p = QFileInfo(QDir::cleanPath(path)).absoluteFilePath();
#ifdef Q_OS_WIN
    const Qt::CaseSensitivity cs = Qt::CaseInsensitive;
#else
    const Qt::CaseSensitivity cs = Qt::CaseSensitive;
#endif
    if (p.compare(b, cs) == 0) return true;
    return p.startsWith(b.endsWith('/') ? b : b + "/", cs);
}

// Unix: the exec bit. Windows has none: Windows games need a known suffix;
// other targets are only inspected there (never launched), any file will do.
static bool runnable(const QFileInfo& fi, const QString& os)
{
    if (os == "windows") {
        static const QSet<QString> exts{"exe", "bat", "cmd", "com"};
        return exts.contains(fi.suffix().toLower());
    }
#ifdef Q_OS_WIN
    return true;
#else
    return fi.isExecutable();
#endif
}

QString findNativeExecutable(const QString& gameDir, const QString& name,
                             const QString& hint, const QString& os)
{
    const QDir dir(gameDir);

    if (!hint.trimmed().isEmpty()) {
        const QString p = dir.absoluteFilePath(hint.trimmed());
        if (isInside(gameDir, p) && QFileInfo(p).isFile())
            return QDir::cleanPath(p);
        return {}; // an explicit hint that is missing/unsafe is an error
    }

    QStringList candidates;
    if (os == "windows") {
        for (const QString& ext : {".exe", ".bat", ".cmd"})
            candidates << name + ext << "bin/" + name + ext;
    } else if (os == "macos") {
        candidates << name << name + ".app/Contents/MacOS/" + name
                   << name + ".sh" << "bin/" + name;
    } else {
        candidates << name << name + ".sh" << "run.sh" << "start.sh"
                   << "bin/" + name << name + ".x86_64" << name + ".AppImage";
    }
    for (const QString& c : candidates) {
        const QFileInfo fi(dir.filePath(c));
        if (fi.isFile() && runnable(fi, os))
            return fi.absoluteFilePath();
    }

    // Fallback: any executable file at the top level.
    const QFileInfoList entries = dir.entryInfoList(QDir::Files, QDir::Name);
    for (const QFileInfo& fi : entries) {
        if (!runnable(fi, os)) continue;
        const QString suffix = fi.suffix().toLower();
        if (suffix == "so" || suffix == "dll" || suffix == "dylib" ||
            suffix == "txt")
            continue;
        return fi.absoluteFilePath();
    }
    return {};
}

} // namespace LaunchResolver
} // namespace Hypernucleus
