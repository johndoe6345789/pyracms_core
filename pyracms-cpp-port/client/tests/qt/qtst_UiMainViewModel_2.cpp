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
    void installPlayStopUninstall();
    void catalogFailureIsReported();
};

void TstUiMainViewModel::installPlayStopUninstall()
{
    AppFixture a;
    QTRY_COMPARE_WITH_TIMEOUT(a.vm->library()->count(), 2, 5000);
    QSignalSpy note(a.vm, &MainViewModel::notify);
    a.vm->select("tetris");
    a.vm->primaryAction(); // Install
    waitFor(a, "play");
    QCOMPARE(a.vm->selected().value("installedVersion").toString(),
             QString("1.0"));
    QVERIFY(a.vm->selected().value("canUninstall").toBool());

    QSignalSpy stopped(a.vm->games(), &GameManager::gameStopped);
    QSignalSpy err(a.vm->games(), &GameManager::gameError);
    a.vm->primaryAction(); // Play
    QTRY_VERIFY_WITH_TIMEOUT(stopped.count() + err.count() == 1, 10000);
    QVERIFY2(a.vm->gameLog().contains("tetris-ran"),
             qPrintable(a.vm->gameLog()));
    a.vm->openLogFile("tetris"); // exists: opens (no toast)

    a.vm->uninstall("tetris");
    waitFor(a, "install");
    QVERIFY(!a.vm->selected().value("installed").toBool());
    bool sawInstalled = false;
    for (const auto& n : note)
        sawInstalled |= n.at(0).toString().contains("installed");
    QVERIFY(sawInstalled);
}

void TstUiMainViewModel::catalogFailureIsReported()
{
    AppFixture a;
    a.http.routes.clear();
    QSignalSpy note(a.vm, &MainViewModel::notify);
    a.vm->refresh();
    QTRY_VERIFY_WITH_TIMEOUT(!a.vm->catalogError().isEmpty(), 5000);
    QVERIFY(note.count() >= 1);
}

QTEST_MAIN(TstUiMainViewModel)
#include "qtst_UiMainViewModel_2.moc"
