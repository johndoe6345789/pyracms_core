#include <QtTest>

#include "SetupFixture.h"

using namespace Hypernucleus;

// The consent prompt, the DownloadCenter progress and the retry, end to end
// against a local "GitHub" serving a zip build of Python.
class TstUiPythonSetup : public QObject {
    Q_OBJECT

private slots:
    void asksThenInstallsThenRetriesTheInstall();
};

void TstUiPythonSetup::asksThenInstallsThenRetriesTheInstall()
{
    SetupFixture s;
    QSignalSpy notes(&s.setup, &PythonSetup::notice);
    QSignalSpy retried(&s.center, &DownloadCenter::gameFailed);
    emit s.pip.pythonMissing("g");
    QTRY_VERIFY_WITH_TIMEOUT(s.setup.promptVisible(), 5000);
    QVERIFY(s.setup.promptText().contains("Python 3.12.9"));
    QVERIFY(!QFileInfo::exists(s.f.paths.dataDir() + "/python"));
    s.setup.accept();
    QVERIFY(!s.setup.promptVisible());
    QVERIFY(s.center.busy()); // shown in the download bar
    QVERIFY(s.center.isExternal());
    QTRY_COMPARE_WITH_TIMEOUT(notes.count(), 1, 8000);
    QVERIFY(QFileInfo::exists(s.f.paths.dataDir() + "/" + kExe));
    QCOMPARE(retried.count(), 1); // "g" was queued again: unknown game
}

QTEST_MAIN(TstUiPythonSetup)
#include "qtst_UiPythonSetup.moc"
