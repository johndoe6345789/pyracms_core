#include <QtTest>
#include <QTemporaryDir>

#include "domain/LaunchResolver.h"

using namespace Hypernucleus;

class TstLaunchPython : public QObject {
    Q_OBJECT

private slots:
    void pythonPathFollowsModuleType();
    void folderModuleAddsParentOnly();
    void bootstrapScriptCallsMain();
};

void TstLaunchPython::pythonPathFollowsModuleType()
{
    QTemporaryDir d;
    InstallRecord game;
    game.name = "g";
    game.path = d.filePath("games/g");
    game.moduleType = "file";
    game.deps = {"lib1", "lib2", "missing"};
    InstallRecord l1;
    l1.path = d.filePath("dependencies/lib1");
    l1.moduleType = "folder";
    InstallRecord l2;
    l2.path = d.filePath("dependencies/lib2"); // unknown type: both
    const QMap<QString, InstallRecord> installed{{"lib1", l1}, {"lib2", l2}};
    QDir().mkpath(d.filePath("pylibs/g"));

    const QStringList p = LaunchResolver::pythonPathEntries(
        game, installed, d.filePath("pylibs/g"));
    QCOMPARE(p, (QStringList{d.filePath("games/g"), d.filePath("dependencies"),
                             d.filePath("dependencies/lib2"),
                             d.filePath("pylibs/g")}));
}

void TstLaunchPython::folderModuleAddsParentOnly()
{
    QTemporaryDir d;
    InstallRecord game;
    game.path = d.filePath("games/g");
    game.moduleType = "folder";
    const QStringList p = LaunchResolver::pythonPathEntries(game, {}, "");
    QCOMPARE(p, QStringList{d.filePath("games")});
}

void TstLaunchPython::bootstrapScriptCallsMain()
{
    const QString s = LaunchResolver::pythonBootstrapScript();
    QVERIFY(s.contains("__import__(name)"));
    QVERIFY(s.contains("mod.main()"));
    QVERIFY(s.contains("os.chdir(sys.argv[2])"));
}

QTEST_APPLESS_MAIN(TstLaunchPython)
#include "qtst_LaunchPython.moc"
