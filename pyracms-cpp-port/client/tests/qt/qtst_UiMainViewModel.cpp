#include <QtTest>

#include "AppFixture.h"
#include "models/GameDepModel.h"
#include "models/GameFilterModel.h"
#include "services/GameManager.h"
#include "viewmodels/DownloadCenter.h"

using namespace Hypernucleus;

static void waitFor(AppFixture& a, const char* kind)
{
    QTRY_COMPARE_WITH_TIMEOUT(a.vm->selected().value("primaryKind").toString(),
                              QString(kind), 10000);
}

class TstUiMainViewModel : public QObject {
    Q_OBJECT

private slots:
    void loadsCatalogAndCategories();
    void selectionShowsDetails();
};

void TstUiMainViewModel::loadsCatalogAndCategories()
{
    AppFixture a;
    QTRY_COMPARE_WITH_TIMEOUT(a.vm->library()->count(), 2, 5000);
    QCOMPARE(a.vm->store()->count(), 2);
    QVERIFY(!a.vm->loading());
    QVERIFY(a.vm->catalogError().isEmpty());
    QCOMPARE(a.vm->appVersion(), QCoreApplication::applicationVersion());
    QCOMPARE(a.vm->osName(), QString("linux"));
    QCOMPARE(a.vm->favouritesCategory(), QString("__favourites__"));
}

void TstUiMainViewModel::selectionShowsDetails()
{
    AppFixture a;
    QTRY_COMPARE_WITH_TIMEOUT(a.vm->library()->count(), 2, 5000);
    QSignalSpy sel(a.vm, &MainViewModel::selectedChanged);
    a.vm->select("tetris");
    QCOMPARE(a.vm->selectedName(), QString("tetris"));
    QTRY_VERIFY_WITH_TIMEOUT(a.vm->selected().value("detailLoaded").toBool(),
                             5000);
    QVERIFY(a.vm->categories().contains("t"));
    QCOMPARE(a.vm->selected().value("primaryKind").toString(),
             QString("install"));
    a.vm->select(QString());
    QVERIFY(a.vm->selected().isEmpty());
    QVERIFY(sel.count() >= 2);
}

QTEST_MAIN(TstUiMainViewModel)
#include "qtst_UiMainViewModel.moc"
