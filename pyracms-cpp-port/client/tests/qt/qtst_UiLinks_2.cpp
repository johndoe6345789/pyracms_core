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
    void otherSiteSwitchesAfterConfirmation();
    void registersUrlSchemeForCurrentUser();
    void loginAndLogoutRefreshCatalog();
};

void TstUiLinks::otherSiteSwitchesAfterConfirmation()
{
    AppFixture a;
    QTRY_COMPARE_WITH_TIMEOUT(a.vm->library()->count(), 2, 5000);
    a.vm->handleUrl("pyracms://launch/other/tetris");
    QVERIFY(a.vm->deepLinks()->siteMismatch());
    QCOMPARE(a.vm->settings()->tenantSlug(), QString("acme"));
    a.vm->deepLinks()->accept();
    QCOMPARE(a.vm->settings()->tenantSlug(), QString("other"));
    const int seen = a.http.paths.size();
    QTRY_VERIFY_WITH_TIMEOUT(a.http.paths.size() > seen, 5000);
}

void TstUiLinks::registersUrlSchemeForCurrentUser()
{
    AppFixture a;
    QSignalSpy note(a.vm, &MainViewModel::notify);
    a.vm->registerUrlScheme();
    QCOMPARE(note.count(), 1);
#ifdef Q_OS_LINUX // a .desktop entry is only how Linux registers schemes
    QVERIFY(QFileInfo::exists(
        QStandardPaths::writableLocation(QStandardPaths::GenericDataLocation) +
        "/applications/hypernucleus-url.desktop"));
#endif
}

void TstUiLinks::loginAndLogoutRefreshCatalog()
{
    AppFixture a;
    a.http.routes["/api/auth/login"] = R"({"token":"t0k"})";
    QTRY_COMPARE_WITH_TIMEOUT(a.vm->library()->count(), 2, 5000);
    QSignalSpy note(a.vm, &MainViewModel::notify);
    a.vm->auth()->login("alice", "pw", "acme");
    QTRY_VERIFY_WITH_TIMEOUT(a.vm->auth()->isAuthenticated(), 5000);
    QTRY_VERIFY_WITH_TIMEOUT(a.http.heads.last().contains("Bearer t0k"), 5000);
    QVERIFY(note.count() >= 1);
    a.vm->logout();
    QVERIFY(!a.vm->auth()->isAuthenticated());
}

QTEST_MAIN(TstUiLinks)
#include "qtst_UiLinks_2.moc"
