#include <QtTest>

#include "AppFixture.h"
#include "models/GameFilterModel.h"
#include "services/AuthService.h"
#include "services/SettingsManager.h"
#include "viewmodels/DeepLinkController.h"
#include "viewmodels/DownloadCenter.h"

using namespace Hypernucleus;

class TstUiLinks : public QObject {
    Q_OBJECT

private slots:
    void installLinkAsksThenInstalls();
    void badLinkIsRejected();
    void launchLinkForInstalledGameRunsWithoutAsking();
};

void TstUiLinks::installLinkAsksThenInstalls()
{
    AppFixture a;
    QTRY_COMPARE_WITH_TIMEOUT(a.vm->library()->count(), 2, 5000);
    QSignalSpy raise(a.vm, &MainViewModel::raiseWindow);
    QSignalSpy show(a.vm, &MainViewModel::showGame);
    a.vm->handleUrl("pyracms://install/acme/racer");
    QCOMPARE(raise.count(), 1);
    QVERIFY(a.vm->deepLinks()->pending());
    QVERIFY(!a.vm->downloads()->busy()); // nothing happens unasked
    a.vm->deepLinks()->accept();
    QCOMPARE(show.count(), 1);
    QVERIFY(a.vm->downloads()->busy());
    QTRY_VERIFY_WITH_TIMEOUT(!a.vm->downloads()->busy(), 10000);
    QCOMPARE(a.vm->selectedName(), QString("racer"));
}

void TstUiLinks::badLinkIsRejected()
{
    AppFixture a;
    QSignalSpy note(a.vm, &MainViewModel::notify);
    a.vm->handleUrl("pyracms://launch/acme/../etc");
    QCOMPARE(note.count(), 1);
    QVERIFY(note.at(0).at(1).toBool());
    QVERIFY(!a.vm->deepLinks()->pending());
    a.vm->handleUrl("pyracms://install/acme/ghost");
    a.vm->deepLinks()->accept(); // game is not on the site
    QTRY_VERIFY_WITH_TIMEOUT(note.count() >= 2, 5000);
}

void TstUiLinks::launchLinkForInstalledGameRunsWithoutAsking()
{
    AppFixture a;
    QTRY_COMPARE_WITH_TIMEOUT(a.vm->library()->count(), 2, 5000);
    QSignalSpy fin(a.vm->downloads(), &DownloadCenter::gameFinished);
    a.vm->install("tetris", "");
    QTRY_COMPARE_WITH_TIMEOUT(fin.count(), 1, 10000);
    QSignalSpy started(a.vm->games(), &GameManager::gameStarted);
    QSignalSpy stopped(a.vm->games(), &GameManager::gameStopped);
    a.vm->handleUrl("pyracms://launch/acme/tetris");
    QVERIFY(!a.vm->deepLinks()->pending()); // same site, installed
    QTRY_VERIFY_WITH_TIMEOUT(started.count() + stopped.count() >= 1, 10000);
}

QTEST_MAIN(TstUiLinks)
#include "qtst_UiLinks.moc"
