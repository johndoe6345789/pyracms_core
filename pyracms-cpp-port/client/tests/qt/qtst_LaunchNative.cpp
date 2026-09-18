#include <QtTest>
#include <QFile>
#include <QTemporaryDir>

#include "domain/LaunchResolver.h"

using namespace Hypernucleus;
using LaunchResolver::findNativeExecutable;

static void touch(const QString& path, bool exec = false)
{
    QDir().mkpath(QFileInfo(path).absolutePath());
    QFile f(path);
    f.open(QIODevice::WriteOnly);
    f.write("x");
    f.close();
    if (exec) f.setPermissions(f.permissions() | QFile::ExeOwner);
}

class TstLaunchNative : public QObject {
    Q_OBJECT

private slots:
    void insideChecksPrefix();
    void hintMustStayInside();
    void candidatesPerOs();
    void fallbackFindsExecutable();
};

void TstLaunchNative::insideChecksPrefix()
{
    QVERIFY(LaunchResolver::isInside("/a/b", "/a/b"));
    QVERIFY(LaunchResolver::isInside("/a/b", "/a/b/c/../d"));
    QVERIFY(!LaunchResolver::isInside("/a/b", "/a/bc"));
    QVERIFY(!LaunchResolver::isInside("/a/b", "/a/b/../c"));
}

void TstLaunchNative::hintMustStayInside()
{
    QTemporaryDir d;
    QTemporaryDir other;
    touch(d.filePath("bin/game"));
    touch(other.filePath("secret"));
    const QString escape =
        d.filePath("../") + other.path().section('/', -1) + "/secret";
    QCOMPARE(findNativeExecutable(d.path(), "g", "bin/game", "linux"),
             QDir::cleanPath(d.filePath("bin/game")));
    QVERIFY(findNativeExecutable(d.path(), "g", escape, "linux").isEmpty());
    QVERIFY(findNativeExecutable(d.path(), "g", "nope", "linux").isEmpty());
}

void TstLaunchNative::candidatesPerOs()
{
    QTemporaryDir d;
    touch(d.filePath("g.exe"));
    touch(d.filePath("g.app/Contents/MacOS/g"), true);
    touch(d.filePath("g.sh"), true);
    QCOMPARE(findNativeExecutable(d.path(), "g", "", "windows"),
             d.filePath("g.exe"));
    QCOMPARE(findNativeExecutable(d.path(), "g", "", "macos"),
             d.filePath("g.app/Contents/MacOS/g"));
    QCOMPARE(findNativeExecutable(d.path(), "g", "", "linux"),
             d.filePath("g.sh"));
}

void TstLaunchNative::fallbackFindsExecutable()
{
    QTemporaryDir d;
    touch(d.filePath("libfoo.so"), true);
    touch(d.filePath("weird-name"), true);
    QCOMPARE(findNativeExecutable(d.path(), "g", "", "linux"),
             d.filePath("weird-name"));
    QTemporaryDir empty;
    QVERIFY(findNativeExecutable(empty.path(), "g", "", "linux").isEmpty());
}

QTEST_APPLESS_MAIN(TstLaunchNative)
#include "qtst_LaunchNative.moc"
