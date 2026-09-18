#include "domain/LaunchResolver.h"

#include <QDir>
#include <QFileInfo>
#include <QSet>

namespace Hypernucleus {
namespace LaunchResolver {

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
        if (it != installed.constEnd()) addModulePath(it.value(), out);
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
