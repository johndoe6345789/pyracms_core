#include <QtTest>

#include "ModelFixture.h"

using namespace Hypernucleus;
using S = GameStates;

static QVariant role(GameDepModel& m, const char* name, int r)
{
    for (int i = 0; i < m.rowCount(); ++i)
        if (m.index(i, 0).data(GameDepModel::NameRole).toString() == name)
            return m.index(i, 0).data(r);
    return {};
}

class TstUiGameModel : public QObject {
    Q_OBJECT

private slots:
    void detailUpdatesRowAndCategories();
};

void TstUiGameModel::detailUpdatesRowAndCategories()
{
    ModelFixture f;
    QSignalSpy cats(&f.model, &GameDepModel::categoriesChanged);
    GameEntry e = *f.repo.find("racer", "game");
    e.tags = {"arcade", "fast"};
    f.repo.setEntries({e}); // rebuild through refreshed()
    QCOMPARE(f.model.rowCount(), 1);
    QVERIFY(cats.count() >= 1);
    QVERIFY(f.model.categories().contains("fast"));
}

QTEST_MAIN(TstUiGameModel)
#include "qtst_UiGameModel_3.moc"
