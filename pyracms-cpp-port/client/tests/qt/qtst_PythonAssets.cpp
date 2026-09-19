#include <QtTest>
#include <QFile>

#include "Fixture.h"
#include "domain/PythonAssets.h"

using namespace Hypernucleus;

// Uses the real release document of astral-sh/python-build-standalone.
class TstPythonAssets : public QObject {
    Q_OBJECT

private slots:
    void tripleNames();
    void picksPerPlatform_data();
    void picksPerPlatform();
    void picksTheNewestPatchLevel();
    void findsHashInSums();
};

void TstPythonAssets::tripleNames()
{
    QCOMPARE(PythonAssets::triple("windows", "x86_64"),
             QString("x86_64-pc-windows-msvc"));
    QCOMPARE(PythonAssets::triple("mac", "aarch64"),
             QString("aarch64-apple-darwin"));
    QCOMPARE(PythonAssets::triple("Linux", "arm64"),
             QString("aarch64-unknown-linux-gnu"));
    QVERIFY(PythonAssets::triple("linux", "x86").isEmpty());
    QVERIFY(PythonAssets::triple("plan9", "x86_64").isEmpty());
}

void TstPythonAssets::picksPerPlatform_data()
{
    QTest::addColumn<QString>("os");
    QTest::addColumn<QString>("arch");
    QTest::addColumn<QString>("needle");
    QTest::newRow("win") << "windows" << "x86_64" << "x86_64-pc-windows";
    QTest::newRow("winarm") << "windows" << "arm64" << "aarch64-pc-windows";
    QTest::newRow("mac") << "macos" << "x86_64" << "x86_64-apple";
    QTest::newRow("macarm") << "macos" << "arm64" << "aarch64-apple";
    QTest::newRow("lin") << "linux" << "x86_64" << "x86_64-unknown-linux-gnu";
    QTest::newRow("linarm") << "linux" << "arm64" << "aarch64-unknown-linux";
}

void TstPythonAssets::picksPerPlatform()
{
    QFETCH(QString, os);
    QFETCH(QString, arch);
    QFETCH(QString, needle);
    const auto a = PythonAssets::pick(fixtureJson("pbs_release.json"), os, arch);
    QVERIFY(a.isValid());
    QVERIFY2(a.name.contains(needle), qPrintable(a.name));
    QVERIFY(a.name.endsWith("-install_only.tar.gz")); // never x86_64_v3 etc.
    QCOMPARE(a.version, QString("3.12.14"));
    QVERIFY(a.size > 1000000);
    QVERIFY(a.url.startsWith("https://github.com/astral-sh/"));
    QVERIFY(!a.isZip());
}

void TstPythonAssets::picksTheNewestPatchLevel()
{
    QJsonObject rel = fixtureJson("pbs_release.json");
    QJsonArray assets = rel.value("assets").toArray();
    QJsonObject old = assets.first().toObject();
    old["name"] = "cpython-3.12.2+20240101-aarch64-apple-darwin-install_only.zip";
    old["browser_download_url"] = "https://x/old.zip";
    assets.prepend(old);
    rel["assets"] = assets;
    QCOMPARE(PythonAssets::pick(rel, "macos", "arm64").version,
             QString("3.12.14"));
    QCOMPARE(PythonAssets::pick(rel, "macos", "arm64", "3.13").isValid(),
             false);
    QVERIFY(PythonAssets::pick({}, "linux", "x86_64").name.isEmpty());
}

void TstPythonAssets::findsHashInSums()
{
    QFile f(QStringLiteral(FIXTURE_DIR) + "/pbs_SHA256SUMS");
    QVERIFY(f.open(QIODevice::ReadOnly));
    const QString sums = QString::fromUtf8(f.readAll());
    const QString name =
        "cpython-3.12.14+20260901-x86_64-pc-windows-msvc-install_only.tar.gz";
    QCOMPARE(PythonAssets::shaFor(sums, name),
             QString("e90c1b6419da3bd812dd73bb3de40287a21abf153438147639ec5e2"
                     "0375ea93f"));
    QVERIFY(PythonAssets::shaFor(sums, "nope.tar.gz").isEmpty());
    QCOMPARE(PythonAssets::shaFor("AB12 *file.zip\n", "file.zip"),
             QString("ab12"));
}

QTEST_MAIN(TstPythonAssets)
#include "qtst_PythonAssets.moc"
