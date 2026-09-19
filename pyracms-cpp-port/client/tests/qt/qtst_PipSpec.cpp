#include <QtTest>

#include "services/PipInstaller.h"
#include "services/PipResolver.h"
#include "services/UrlSchemeRegistrar.h"

using namespace Hypernucleus;

class TstPipSpec : public QObject {
    Q_OBJECT

private slots:
    void acceptsPlainSpecs_data();
    void acceptsPlainSpecs();
    void buildsArguments();
    void normalizesPackageNames();
    void desktopEntryClaimsScheme();
    void windowsCommandQuotesPath();
};

void TstPipSpec::acceptsPlainSpecs_data()
{
    QTest::addColumn<QString>("spec");
    QTest::addColumn<bool>("ok");
    QTest::newRow("name") << "requests" << true;
    QTest::newRow("pinned") << "numpy==1.26.4" << true;
    QTest::newRow("range") << "pillow >=9, <11" << true;
    QTest::newRow("extras") << "uvicorn[standard]>=0.2" << true;
    QTest::newRow("url") << "https://evil.example/x.whl" << false;
    QTest::newRow("vcs") << "git+https://x/y" << false;
    QTest::newRow("option") << "--index-url=http://x" << false;
    QTest::newRow("path") << "../local" << false;
    QTest::newRow("shell") << "a; rm -rf /" << false;
    QTest::newRow("empty") << "" << false;
}

void TstPipSpec::acceptsPlainSpecs()
{
    QFETCH(QString, spec);
    QFETCH(bool, ok);
    QCOMPARE(PipInstaller::isValidSpec(spec), ok);
}

void TstPipSpec::buildsArguments()
{
    const QStringList a =
        PipInstaller::buildArguments("/r.txt", {"a", "b"});
    QCOMPARE(a.mid(0, 3), (QStringList{"-m", "pip", "install"}));
    QVERIFY(!a.contains("--target")); // packages go into the venv
    QCOMPARE(PipInstaller::venvArguments("/v"),
             (QStringList{"-m", "venv", "/v"}));
    QCOMPARE(a.mid(a.size() - 4), (QStringList{"-r", "/r.txt", "a", "b"}));
    QVERIFY(!PipInstaller::buildArguments("", {}).contains("-r"));
}

void TstPipSpec::normalizesPackageNames()
{
    QCOMPARE(PipResolver::normalizeName(" Py_Game.Core "),
             QString("py-game-core"));
    QCOMPARE(PipResolver::normalizeName("A--B"), QString("a-b"));
}

void TstPipSpec::desktopEntryClaimsScheme()
{
    const QString e = UrlSchemeRegistrar::desktopEntry("/opt/h n/hn");
    QVERIFY(e.contains("MimeType=x-scheme-handler/pyracms;"));
    QVERIFY(e.contains("Exec=\"/opt/h n/hn\" %u"));
    QVERIFY(e.contains("NoDisplay=true"));
}

void TstPipSpec::windowsCommandQuotesPath()
{
    const QString c = UrlSchemeRegistrar::windowsCommand("C:/Apps/hn.exe");
    QVERIFY(c.startsWith('"'));
    QVERIFY(c.endsWith("\"%1\""));
    QVERIFY(c.contains("hn.exe"));
}

QTEST_APPLESS_MAIN(TstPipSpec)
#include "qtst_PipSpec.moc"
