#include <QtTest>

#include "BackendView.h"
#include "ModelFixture.h"
#include "domain/CatalogParser.h"
#include "viewmodels/SelectedGameView.h"

using namespace Hypernucleus;

// What the UI shows from the backend's per-revision data: download size for
// this platform, owner, download count, tags, screenshots.
class TstUiBackendData : public QObject {
    Q_OBJECT

private slots:
    void detailPageShowsSizeOwnerTagsAndShots();
    void windowsArm64ExplainsTheEmulatedBuild();
};

void TstUiBackendData::detailPageShowsSizeOwnerTagsAndShots()
{
    const GameEntry e = bvSnake();
    const QVariantMap m = bvView(e, "macos", "arm64");
    QCOMPARE(m.value("downloadSize").toString(), QString("4.69 KB"));
    QCOMPARE(m.value("downloadNote").toString(), QString());
    QCOMPARE(m.value("owner").toString(), QString("admin"));
    QCOMPARE(m.value("tags").toStringList(),
             (QStringList{"arcade", "classic", "pygame"}));
    QCOMPARE(m.value("screenshots").toStringList().size(), 1);
    QCOMPARE(m.value("screenshotCount").toInt(), 1);
    QCOMPARE(m.value("depCount").toInt(), 2);
}

void TstUiBackendData::windowsArm64ExplainsTheEmulatedBuild()
{
    const GameEntry e = bvSnake();
    const QVariantMap m = bvView(e, "windows", "arm64");
    QCOMPARE(m.value("downloadSize").toString(), QString("4.00 KB"));
    QVERIFY(m.value("downloadNote").toString().contains("emulated"));
    QVERIFY(bvView(e, "windows", "x86_64").value("downloadNote").isValid());
    QVERIFY(bvView(e, "windows", "x86_64")
                .value("downloadNote")
                .toString()
                .isEmpty());
}

QTEST_MAIN(TstUiBackendData)
#include "qtst_UiBackendData.moc"
