#include <QtTest>

#include "Fixtures.h"
#include "models/Constants.h"
#include "viewmodels/SelectedGameView.h"

using namespace Hypernucleus;
using S = GameStates;
using SelectedGameView::primaryFor;

class TstUiSelectedView : public QObject {
    Q_OBJECT

private slots:
    void buildsPageData();
    void emptyEntryGivesEmptyMap();
    void listsPublishedVersionsNewestFirst();
};

void TstUiSelectedView::buildsPageData()
{
    auto e = entry("tetris", "game", {rev("1.0", "a"), rev("1.2", "b")},
                   {dep("pygame")});
    e.screenshots = {"s1"};
    e.tags = {"x"};
    e.likes = 3;
    SelectedGameView::Input in;
    in.entry = &e;
    in.state = S::UpdateAvailable;
    in.record.name = "tetris";
    in.record.version = "1.0";
    in.record.path = "/games/tetris";
    in.record.sizeBytes = 2048;
    in.mediaUrl = [](const QString& p) { return "http://h" + p; };
    const QVariantMap m = SelectedGameView::build(in);
    QCOMPARE(m["title"].toString(), QString("TETRIS"));
    QCOMPARE(m["latestVersion"].toString(), QString("1.2"));
    QCOMPARE(m["selectedVersion"].toString(), QString("1.0")); // installed
    QVERIFY(m["updateAvailable"].toBool());
    QCOMPARE(m["primaryKind"].toString(), QString("update"));
    QCOMPARE(m["screenshots"].toStringList(),
             QStringList{"http://h/api/files/s1"});
    QCOMPARE(m["cover"].toString(), QString("http://h/api/files/s1"));
    QCOMPARE(m["installSize"].toString(), QString("2.00 KB"));
    QCOMPARE(m["depCount"].toInt(), 1);
    QVERIFY(m["canUninstall"].toBool());
    in.state = S::Running;
    QVERIFY(!SelectedGameView::build(in)["canUninstall"].toBool());
}

void TstUiSelectedView::emptyEntryGivesEmptyMap()
{
    QVERIFY(SelectedGameView::build(SelectedGameView::Input()).isEmpty());
}

void TstUiSelectedView::listsPublishedVersionsNewestFirst()
{
    const auto e =
        entry("g", "game",
              {rev("1.9", "a"), rev("1.10", "b"), rev("2.0", "c", false)});
    QCOMPARE(SelectedGameView::publishedVersions(e),
             (QStringList{"1.10", "1.9"}));
}

QTEST_APPLESS_MAIN(TstUiSelectedView)
#include "qtst_UiSelectedView_2.moc"
