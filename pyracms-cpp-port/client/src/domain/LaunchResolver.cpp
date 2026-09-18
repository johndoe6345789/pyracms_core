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
        return {};  // an explicit hint that is missing/unsafe is an error
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
    const QFileInfoList entries = dir.entryInfoList(QDir::Files | QDir::Executable,
                                                    QDir::Name);
    for (const QFileInfo& fi : entries) {
        const QString suffix = fi.suffix().toLower();
        if (suffix == "so" || suffix == "dll" || suffix == "dylib" || suffix == "txt")
            continue;
        return fi.absoluteFilePath();
    }
    return {};
}

namespace {

void addModulePath(const InstallRecord& rec, QStringList& out)
{
    const QString self = QDir::cleanPath(rec.path);
    const QString parent = QFileInfo(self).dir().absolutePath();
    if (rec.moduleType == "file") {
        out << self;
    } else if (rec.moduleType == "folder") {
        out << parent;
    } else {
        out << self << parent;
    }
}

} // namespace

QStringList pythonPathEntries(const InstallRecord& game,
                              const QMap<QString, InstallRecord>& installed,
                              const QString& pipTargetDir)
{
    QStringList out;
    addModulePath(game, out);
    for (const QString& depName : game.deps) {
        const auto it = installed.constFind(depName);
        if (it != installed.constEnd())
            addModulePath(it.value(), out);
    }
    if (!pipTargetDir.isEmpty() && QFileInfo(pipTargetDir).isDir())
        out << QDir::cleanPath(pipTargetDir);

    QStringList unique;
    QSet<QString> seen;
    for (const QString& p : out) {
        if (!seen.contains(p)) {
            seen.insert(p);
            unique << p;
        }
    }
    return unique;
}

QString pythonBootstrapScript()
{
    return QStringLiteral(
        "import os, sys\n"
        "name = sys.argv[1]\n"
        "os.chdir(sys.argv[2])\n"
        "sys.argv = [name] + sys.argv[3:]\n"
        "try:\n"
        "    mod = __import__(name)\n"
        "except ImportError:\n"
        "    import runpy\n"
        "    for f in ('__main__.py', 'main.py', name + '.py'):\n"
        "        if os.path.isfile(f):\n"
        "            runpy.run_path(f, run_name='__main__')\n"
        "            sys.exit(0)\n"
        "    raise\n"
        "else:\n"
        "    if hasattr(mod, 'main'):\n"
        "        mod.main()\n");
}

} // namespace LaunchResolver
} // namespace Hypernucleus
