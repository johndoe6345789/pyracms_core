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
    void installedGamesSortFirst();
    void searchMatchesTitleNameAndTags();
    void installedAndUpdatesFilters();
};

void TstUiFilterModel::installedGamesSortFirst()
{
    ModelFixture f({{"tetris", "1.2"}});
    GameFilterModel p;
    p.setSourceModel(&f.model);
    QCOMPARE(names(p), (QStringList{"tetris", "racer"}));
}

void TstUiFilterModel::searchMatchesTitleNameAndTags()
{
    ModelFixture f;
    GameFilterModel p;
    p.setSourceModel(&f.model);
    p.setSearchText("TET");
    QCOMPARE(names(p), QStringList{"tetris"});
    p.setSearchText("arcade"); // tag
    QCOMPARE(names(p), QStringList{"racer"});
    p.setSearchText("nothing");
    QCOMPARE(p.count(), 0);
    p.setSearchText("");
    QCOMPARE(p.count(), 2);
}

void TstUiFilterModel::installedAndUpdatesFilters()
{
    ModelFixture f({{"tetris", "1.0"}, {"racer", "0.5"}});
    GameFilterModel p;
    p.setSourceModel(&f.model);
    p.setFilter(S::FilterInstalled);
    QCOMPARE(p.count(), 2);
    p.setFilter(S::FilterUpdates);
    QCOMPARE(names(p), QStringList{"tetris"}); // 1.0 < 1.2
    p.setFilter(S::FilterAll);
    QCOMPARE(p.count(), 2);
    ModelFixture none;
    GameFilterModel q;
    q.setSourceModel(&none.model);
    q.setFilter(S::FilterInstalled);
    QCOMPARE(q.count(), 0);
}

QTEST_MAIN(TstUiFilterModel)
#include "qtst_UiFilterModel.moc"
