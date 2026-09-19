#include <QtTest>

#include "SetupFixture.h"

using namespace Hypernucleus;

// The consent prompt, the DownloadCenter progress and the retry, end to end
// against a local "GitHub" serving a zip build of Python.
class TstUiPythonSetup2 : public QObject {
    Q_OBJECT

private slots:
    void declineDoesNothing();
    void launchIsRetriedAfterwards();
};

void TstUiPythonSetup2::declineDoesNothing()
{
    SetupFixture s;
    emit s.pip.pythonMissing("g");
    QTRY_VERIFY_WITH_TIMEOUT(s.setup.promptVisible(), 5000);
    s.setup.decline();
    QVERIFY(!s.setup.promptVisible());
    QVERIFY(!s.setup.busy());
    QVERIFY(!s.center.busy());
    QVERIFY(s.http.paths.filter("py.zip").isEmpty());
}

void TstUiPythonSetup2::launchIsRetriedAfterwards()
{
    SetupFixture s;
    QSignalSpy err(&s.games, &GameManager::gameError);
    emit s.games.pythonMissing("g");
    QTRY_VERIFY_WITH_TIMEOUT(s.setup.promptVisible(), 5000);
    s.setup.accept();
    QTRY_COMPARE_WITH_TIMEOUT(err.count(), 1, 8000); // launch: not installed
    QVERIFY(!s.center.busy());
}

QTEST_MAIN(TstUiPythonSetup2)
#include "qtst_UiPythonSetup_2.moc"
