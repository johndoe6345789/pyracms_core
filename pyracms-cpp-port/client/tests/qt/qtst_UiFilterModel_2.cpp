#include <QtTest>

#include "ModelFixture.h"
#include "models/DependencyModel.h"
#include "models/GameFilterModel.h"

using namespace Hypernucleus;
using S = GameStates;

static QStringList names(GameFilterModel& m)
{
    QStringList out;
    for (int i = 0; i < m.rowCount(); ++i)
        out << m.nameAt(i);
    return out;
}

class TstUiFilterModel : public QObject {
    Q_OBJECT

private slots:
    void categoryAndFavourites();
    void indexAndNameLookup();
    void countSignalTracksChanges();
};

void TstUiFilterModel::categoryAndFavourites()
{
    ModelFixture f;
    GameFilterModel p;
    p.setSourceModel(&f.model);
    p.setCategory("puzzle");
    QCOMPARE(names(p), QStringList{"tetris"});
    p.setCategory(CATEGORY_FAVOURITES);
    QCOMPARE(p.count(), 0);
    f.model.toggleFavourite("racer"); // re-filters without a reset
    QCOMPARE(names(p), QStringList{"racer"});
    p.setCategory("");
    QCOMPARE(p.count(), 2);
}

void TstUiFilterModel::indexAndNameLookup()
{
    ModelFixture f;
    GameFilterModel p;
    p.setSourceModel(&f.model);
    QCOMPARE(p.indexOfName("tetris"), 1);
    QCOMPARE(p.indexOfName("ghost"), -1);
    QCOMPARE(p.nameAt(0), QString("racer"));
    QCOMPARE(p.nameAt(-1), QString());
    QCOMPARE(p.nameAt(9), QString());
}

void TstUiFilterModel::countSignalTracksChanges()
{
    ModelFixture f;
    GameFilterModel p;
    p.setSourceModel(&f.model);
    QSignalSpy c(&p, &GameFilterModel::countChanged);
    p.setSearchText("x");
    p.setSearchText("x"); // unchanged: no second signal
    QCOMPARE(c.count(), 1);
    QCOMPARE(p.searchText(), QString("x"));
}

QTEST_MAIN(TstUiFilterModel)
#include "qtst_UiFilterModel_2.moc"
