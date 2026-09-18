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
    void listsGamesSortedByTitleWithoutDeps();
    void exposesCatalogRoles();
    void stateFollowsInstallState();
};

void TstUiGameModel::listsGamesSortedByTitleWithoutDeps()
{
    ModelFixture f;
    QCOMPARE(f.model.rowCount(), 2);
    QCOMPARE(f.model.count(), 2);
    QCOMPARE(f.model.index(0, 0).data(GameDepModel::NameRole).toString(),
             QString("racer"));
    QCOMPARE(f.model.categories(),
             (QStringList{"arcade", "classic", "puzzle"}));
}

void TstUiGameModel::exposesCatalogRoles()
{
    ModelFixture f;
    QCOMPARE(role(f.model, "tetris", GameDepModel::TitleRole).toString(),
             QString("TETRIS"));
    QCOMPARE(role(f.model, "tetris", GameDepModel::LatestVersionRole),
             QVariant("1.2"));
    QCOMPARE(role(f.model, "tetris", GameDepModel::DescriptionRole),
             QVariant("Falling blocks"));
    QVERIFY(role(f.model, "tetris", GameDepModel::AccentRole).isValid());
    QCOMPARE(role(f.model, "tetris", GameDepModel::CoverRole).toString(),
             QString());
    f.api.setBaseUrl("http://srv");
    QCOMPARE(role(f.model, "racer", GameDepModel::CoverRole).toString(),
             QString("http://srv/api/files/hero-ref"));
    QCOMPARE(role(f.model, "racer", GameDepModel::GroupRole).toString(),
             QString("Not installed"));
}

void TstUiGameModel::stateFollowsInstallState()
{
    ModelFixture f({{"tetris", "1.0"}, {"racer", "0.5"}});
    QCOMPARE(f.model.stateOf("tetris"), int(S::UpdateAvailable));
    QCOMPARE(f.model.stateOf("racer"), int(S::Installed));
    QCOMPARE(f.model.stateOf("unknown"), int(S::NotInstalled));
    QVERIFY(
        role(f.model, "tetris", GameDepModel::UpdateAvailableRole).toBool());
    QCOMPARE(role(f.model, "tetris", GameDepModel::InstalledVersionRole),
             QVariant("1.0"));
    QCOMPARE(role(f.model, "racer", GameDepModel::GroupRole).toString(),
             QString("Installed"));
    ModelFixture g;
    QCOMPARE(g.model.stateOf("tetris"), int(S::NotInstalled));
}

QTEST_MAIN(TstUiGameModel)
#include "qtst_UiGameModel.moc"
