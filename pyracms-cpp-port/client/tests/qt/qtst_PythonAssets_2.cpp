#include <QtTest>
#include <QFile>

#include "Fixture.h"
#include "domain/PythonAssets.h"

using namespace Hypernucleus;

// Uses the real release document of astral-sh/python-build-standalone.

class TstPythonAssets2 : public QObject {
    Q_OBJECT

private slots:
    void picksTheNewestPatchLevel();
    void findsHashInSums();
};

void TstPythonAssets2::picksTheNewestPatchLevel()
{
    QJsonObject rel = fixtureJson("pbs_release.json");
    QJsonArray assets = rel.value("assets").toArray();
    QJsonObject old = assets.first().toObject();
    old["name"] =
        "cpython-3.12.2+20240101-aarch64-apple-darwin-install_only.zip";
    old["browser_download_url"] = "https://x/old.zip";
    assets.prepend(old);
    rel["assets"] = assets;
    QCOMPARE(PythonAssets::pick(rel, "macos", "arm64").version,
             QString("3.12.14"));
    QCOMPARE(PythonAssets::pick(rel, "macos", "arm64", "3.13").isValid(),
             false);
    QVERIFY(PythonAssets::pick({}, "linux", "x86_64").name.isEmpty());
}

void TstPythonAssets2::findsHashInSums()
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

QTEST_MAIN(TstPythonAssets2)
#include "qtst_PythonAssets_2.moc"
