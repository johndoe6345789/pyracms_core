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
    void transientStateWinsAndClears();
    void primaryButtonRolesFollowState();
    void favouritesPersist();
    void rolesHaveNamesAndBadRowsAreEmpty();
};

void TstUiGameModel::transientStateWinsAndClears()
{
    ModelFixture f;
    QSignalSpy changed(&f.model, &QAbstractItemModel::dataChanged);
    f.model.setTransient("tetris", S::Downloading, 0.4, "Downloading 40%");
    QCOMPARE(f.model.stateOf("tetris"), int(S::Downloading));
    QCOMPARE(f.model.progressOf("tetris"), 0.4);
    QCOMPARE(f.model.statusTextOf("tetris"), QString("Downloading 40%"));
    QVERIFY(changed.count() >= 1);
    f.model.clearTransient("tetris");
    QCOMPARE(f.model.stateOf("tetris"), int(S::NotInstalled));
    f.model.clearTransient("tetris"); // nothing left: no signal
}

void TstUiGameModel::primaryButtonRolesFollowState()
{
    ModelFixture f({{"racer", "0.5"}});
    QCOMPARE(role(f.model, "racer", GameDepModel::PrimaryKindRole),
             QVariant("play"));
    QCOMPARE(role(f.model, "tetris", GameDepModel::PrimaryLabelRole),
             QVariant("Install"));
    f.model.setTransient("tetris", S::Downloading, 0.5, "");
    QCOMPARE(role(f.model, "tetris", GameDepModel::PrimaryLabelRole),
             QVariant("Installing 50%"));
}

void TstUiGameModel::favouritesPersist()
{
    ModelFixture f;
    QVERIFY(!f.model.isFavourite("tetris"));
    f.model.toggleFavourite("tetris");
    QVERIFY(f.model.isFavourite("tetris"));
    QVERIFY(role(f.model, "tetris", GameDepModel::FavouriteRole).toBool());
    GameDepModel again; // reads QSettings
    QCOMPARE(again.favourites(), QStringList{"tetris"});
    f.model.toggleFavourite("tetris");
    QVERIFY(f.model.favourites().isEmpty());
}

void TstUiGameModel::rolesHaveNamesAndBadRowsAreEmpty()
{
    ModelFixture f;
    const auto names = f.model.roleNames().values();
    for (const char* n : {"name", "title", "gameState", "progress", "cover",
                          "primaryKind", "primaryLabel", "favourite"})
        QVERIFY2(names.contains(n), n);
    QVERIFY(!names.contains("state")); // would be shadowed by Item.state
    QVERIFY(!f.model.index(99, 0).data().isValid());
    QCOMPARE(f.model.rowCount(f.model.index(0, 0)), 0);
}

QTEST_MAIN(TstUiGameModel)
#include "qtst_UiGameModel_2.moc"
