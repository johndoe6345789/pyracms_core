#include <QtTest>

#include "BackendView.h"
#include "ModelFixture.h"
#include "domain/CatalogParser.h"
#include "viewmodels/SelectedGameView.h"

using namespace Hypernucleus;

// What the UI shows from the backend's per-revision data: download size for
// this platform, owner, download count, tags, screenshots.

class TstUiBackendData2 : public QObject {
    Q_OBJECT

private slots:
    void modelRowsCarrySizeAndScreenshotCount();
};

void TstUiBackendData2::modelRowsCarrySizeAndScreenshotCount()
{
    ModelFixture f;
    GameEntry e = bvSnake();
    f.repo.setEntries({e});
    f.model.setPlatform("linux", "x86_64");
    const QModelIndex i = f.model.index(0, 0);
    QCOMPARE(f.model.data(i, GameDepRows::SizeRole).toString(),
             QString("4.39 KB"));
    QCOMPARE(f.model.data(i, GameDepRows::ScreenshotCountRole).toInt(), 1);
    QCOMPARE(f.model.data(i, GameDepRows::TagsRole).toStringList().size(), 3);
    f.model.setPlatform("windows", "arm64");
    QCOMPARE(f.model.data(i, GameDepRows::SizeRole).toString(),
             QString("4.00 KB"));
}

QTEST_MAIN(TstUiBackendData2)
#include "qtst_UiBackendData_2.moc"
