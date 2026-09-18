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
    void dependencyModelListsEntries();
};

void TstUiFilterModel::dependencyModelListsEntries()
{
    DependencyModel m;
    QSignalSpy c(&m, &DependencyModel::countChanged);
    m.populate({dep("pygame", "2.0"), dep("requests", "", "pip")},
               {{"pygame", "2.0"}});
    QCOMPARE(m.count(), 2);
    QCOMPARE(m.index(0, 0).data(Qt::DisplayRole).toString(),
             QString("pygame (2.0)"));
    QCOMPARE(m.index(1, 0).data(Qt::DisplayRole).toString(),
             QString("requests"));
    QVERIFY(m.index(0, 0).data(DependencyModel::DepInstalledRole).toBool());
    QVERIFY(!m.index(1, 0).data(DependencyModel::DepInstalledRole).toBool());
    QCOMPARE(m.index(1, 0).data(DependencyModel::DepSourceRole).toString(),
             QString("pip"));
    QVERIFY(m.roleNames().values().contains("installed"));
    m.clear();
    QCOMPARE(m.rowCount(), 0);
    QCOMPARE(c.count(), 2);
    QVERIFY(!m.index(3, 0).data().isValid());
}

QTEST_MAIN(TstUiFilterModel)
#include "qtst_UiFilterModel_3.moc"
