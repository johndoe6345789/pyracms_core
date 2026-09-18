#include "domain/LaunchResolver.h"

#include <QDir>
#include <QFileInfo>
#include <QSet>

namespace Hypernucleus {
namespace LaunchResolver {

bool isInside(const QString& base, const QString& path)
{
    const QString b = QDir::cleanPath(QDir(base).absolutePath());
    const QString p = QDir::cleanPath(QDir(path).absolutePath());
    return p == b || p.startsWith(b + "/");
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
        if (fi.isFile() && (os == "windows" || fi.isExecutable()))
            return fi.absoluteFilePath();
    }

    // Fallback: any executable file at the top level.
    const QFileInfoList entries =
        dir.entryInfoList(QDir::Files | QDir::Executable, QDir::Name);
    for (const QFileInfo& fi : entries) {
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
