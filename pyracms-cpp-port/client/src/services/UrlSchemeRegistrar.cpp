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
    return QStringLiteral(
        "[Desktop Entry]\n"
        "Type=Application\n"
        "Name=Hypernucleus\n"
        "Comment=Game launcher for PyraCMS sites\n"
        "Exec=\"%1\" %u\n"
        "Terminal=false\n"
        "NoDisplay=true\n"
        "Categories=Game;\n"
        "MimeType=x-scheme-handler/pyracms;\n").arg(exec);
}

QString windowsCommand(const QString& exePath)
{
    return QStringLiteral("\"%1\" \"%2\"").arg(QDir::toNativeSeparators(exePath), "%1");
}

namespace {

#ifdef Q_OS_WIN
bool regAdd(const QStringList& args, QString* error)
{
    QProcess p;
    p.start("reg", QStringList{"add"} + args + QStringList{"/f"});
    if (!p.waitForFinished(10000) || p.exitCode() != 0) {
        if (error)
            *error = "reg.exe failed: " + QString::fromLocal8Bit(p.readAllStandardError());
        return false;
    }
    return true;
}
#endif

} // namespace

bool registerForCurrentUser(const QString& exePath, QString* error)
{
#if defined(Q_OS_WIN)
    const QString base = "HKCU\\Software\\Classes\\pyracms";
    return regAdd({base, "/ve", "/d", "URL:PyraCMS Protocol"}, error)
        && regAdd({base, "/v", "URL Protocol", "/d", ""}, error)
        && regAdd({base + "\\shell\\open\\command", "/ve", "/d", windowsCommand(exePath)}, error);
#elif defined(Q_OS_MACOS)
    Q_UNUSED(exePath)
    if (error)
        *error = "On macOS the pyracms:// scheme is declared in the app bundle's "
                 "Info.plist (see client/README.md).";
    return false;
#else
    const QString dir = QStandardPaths::writableLocation(QStandardPaths::GenericDataLocation)
                        + "/applications";
    QDir().mkpath(dir);
    QFile f(dir + "/hypernucleus-url.desktop");
    if (!f.open(QIODevice::WriteOnly | QIODevice::Truncate)) {
        if (error)
            *error = "Cannot write " + f.fileName();
        return false;
    }
    f.write(desktopEntry(exePath).toUtf8());
    f.close();

    QProcess::execute("xdg-mime", {"default", "hypernucleus-url.desktop",
                                   "x-scheme-handler/pyracms"});
    QProcess::execute("update-desktop-database", {dir});
    return true;
#endif
}

} // namespace UrlSchemeRegistrar
} // namespace Hypernucleus
