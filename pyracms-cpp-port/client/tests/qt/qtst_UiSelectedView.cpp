#include <QtTest>

#include "Fixtures.h"
#include "models/Constants.h"
#include "viewmodels/SelectedGameView.h"

using namespace Hypernucleus;
using S = GameStates;
using SelectedGameView::primaryFor;

class TstUiSelectedView : public QObject {
    Q_OBJECT

private slots:
    void primaryButtonTable_data();
    void primaryButtonTable();
    void versionSwitchOffersInstall();
};

void TstUiSelectedView::primaryButtonTable_data()
{
    QTest::addColumn<int>("state");
    QTest::addColumn<QString>("kind");
    QTest::addColumn<QString>("label");
    QTest::addColumn<bool>("enabled");
    QTest::newRow("install")
        << int(S::NotInstalled) << "install" << "Install" << true;
    QTest::newRow("play") << int(S::Installed) << "play" << "Play" << true;
    QTest::newRow("update")
        << int(S::UpdateAvailable) << "update" << "Update" << true;
    QTest::newRow("queued") << int(S::Queued) << "cancel" << "Queued" << true;
    QTest::newRow("verify")
        << int(S::Verifying) << "cancel" << "Verifying..." << true;
    QTest::newRow("installing")
        << int(S::Installing) << "cancel" << "Installing..." << true;
    QTest::newRow("launching")
        << int(S::Launching) << "none" << "Launching..." << false;
    QTest::newRow("running") << int(S::Running) << "stop" << "Stop" << true;
    QTest::newRow("launch failed")
        << int(S::LaunchFailed) << "play" << "Launch failed - Retry" << true;
    QTest::newRow("install failed") << int(S::InstallFailed) << "install"
                                    << "Install failed - Retry" << true;
}

void TstUiSelectedView::primaryButtonTable()
{
    QFETCH(int, state);
    QFETCH(QString, kind);
    QFETCH(QString, label);
    QFETCH(bool, enabled);
    const auto p = primaryFor(state, 0.0, "1.0", "1.0");
    QCOMPARE(p.kind, kind);
    QCOMPARE(p.label, label);
    QCOMPARE(p.enabled, enabled);
}

void TstUiSelectedView::versionSwitchOffersInstall()
{
    QCOMPARE(primaryFor(S::Downloading, 0.42, "1", "1").label,
             QString("Installing 42%"));
    QCOMPARE(primaryFor(S::Downloading, -1, "1", "1").label,
             QString("Installing..."));
    const auto p = primaryFor(S::Installed, 0, "1.0", "0.9");
    QCOMPARE(p.kind, QString("install"));
    QCOMPARE(p.label, QString("Install v0.9"));
    QCOMPARE(primaryFor(S::Installed, 0, "1.0", "1").kind, QString("play"));
}

QTEST_APPLESS_MAIN(TstUiSelectedView)
#include "qtst_UiSelectedView.moc"
