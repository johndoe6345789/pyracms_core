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
    void favouritesAndVersionSelection();
    void unknownGameIsRejected();
};

void TstUiMainViewModel::favouritesAndVersionSelection()
{
    AppFixture a;
    QTRY_COMPARE_WITH_TIMEOUT(a.vm->library()->count(), 2, 5000);
    a.vm->select("racer");
    a.vm->toggleFavourite("racer");
    QVERIFY(a.vm->selected().value("favourite").toBool());
    a.vm->selectVersion("0.5");
    QCOMPARE(a.vm->selected().value("selectedVersion").toString(),
             QString("0.5"));
    QSignalSpy note(a.vm, &MainViewModel::notify);
    a.vm->openLogFile("racer"); // never launched
    QCOMPARE(note.count(), 1);
    a.vm->openInstallFolder("racer"); // not installed: no-op
}

void TstUiMainViewModel::unknownGameIsRejected()
{
    AppFixture a;
    QSignalSpy note(a.vm, &MainViewModel::notify);
    a.vm->install("ghost", "");
    a.vm->launch("ghost");
    a.vm->primaryActionFor("ghost");
    QVERIFY(note.count() >= 2);
    for (const auto& n : note)
        QVERIFY(n.at(1).toBool()); // all errors
    a.vm->stop();                  // nothing running: harmless
    a.vm->cancelDownload("ghost");
}

QTEST_MAIN(TstUiMainViewModel)
#include "qtst_UiMainViewModel_3.moc"
