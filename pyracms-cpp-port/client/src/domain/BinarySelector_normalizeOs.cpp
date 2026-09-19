#include "domain/BinarySelector.h"


namespace Hypernucleus {
namespace BinarySelector {


QString normalizeOs(const QString& os)
{
    const QString s = os.trimmed().toLower();
    if (s == "win" || s == "win32" || s == "win64" || s == "windows")
        return QStringLiteral("windows");
    if (s == "mac" || s == "macos" || s == "darwin" || s == "osx" ||
        s == "mac os x")
        return QStringLiteral("macos");
    if (s == "lin" || s == "linux") return QStringLiteral("linux");
    return s;
}

QString normalizeArch(const QString& arch)
{
    const QString s = arch.trimmed().toLower();
    if (s == "x86_64" || s == "amd64" || s == "x64" || s == "x86-64" ||
        s == "64bit")
        return QStringLiteral("x86_64");
    if (s == "arm64" || s == "aarch64") return QStringLiteral("arm64");
    if (s == "x86" || s == "i386" || s == "i686" || s == "32bit")
        return QStringLiteral("x86");
    return s;
}

bool isPlatformIndependent(const QString& value)
{
    const QString s = value.trimmed().toLower();
    return s.isEmpty() || s == "pi" || s == "any" || s == "all" || s == "*";
}

} // namespace BinarySelector
} // namespace Hypernucleus
