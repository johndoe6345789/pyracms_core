#include "services/UrlSchemeRegistrar.h"

#include <QDir>
#include <QFile>
#include <QProcess>
#include <QStandardPaths>

namespace Hypernucleus {
namespace UrlSchemeRegistrar {

QString desktopEntry(const QString& exePath)
{
    QString exec = exePath;
    exec.replace("\\", "\\\\").replace("\"", "\\\"");
    return QStringLiteral("[Desktop Entry]\n"
                          "Type=Application\n"
                          "Name=Hypernucleus\n"
                          "Comment=Game launcher for PyraCMS sites\n"
                          "Exec=\"%1\" %u\n"
                          "Terminal=false\n"
                          "NoDisplay=true\n"
                          "Categories=Game;\n"
                          "MimeType=x-scheme-handler/pyracms;\n")
        .arg(exec);
}

QString windowsCommand(const QString& exePath)
{
    return QStringLiteral("\"%1\" \"%2\"")
        .arg(QDir::toNativeSeparators(exePath), "%1");
}

} // namespace UrlSchemeRegistrar
} // namespace Hypernucleus
