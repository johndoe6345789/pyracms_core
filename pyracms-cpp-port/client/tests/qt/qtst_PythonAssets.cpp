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
    const auto a =
        PythonAssets::pick(fixtureJson("pbs_release.json"), os, arch);
    QVERIFY(a.isValid());
    QVERIFY2(a.name.contains(needle), qPrintable(a.name));
    QVERIFY(a.name.endsWith("-install_only.tar.gz")); // never x86_64_v3 etc.
    QCOMPARE(a.version, QString("3.12.14"));
    QVERIFY(a.size > 1000000);
    QVERIFY(a.url.startsWith("https://github.com/astral-sh/"));
    QVERIFY(!a.isZip());
}

QTEST_MAIN(TstPythonAssets)
#include "qtst_PythonAssets.moc"
