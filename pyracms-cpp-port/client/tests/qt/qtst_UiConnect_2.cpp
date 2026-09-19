#include <QtTest>

#include "AppFixture.h"
#include "models/GameFilterModel.h"
#include "services/AuthService.h"
#include "viewmodels/ConnectController.h"

using namespace Hypernucleus;

class TstUiConnect : public QObject {
    Q_OBJECT

private slots:
    void anonymousUserCanInstallPublicGames();
    void switchingSiteSignsTheAccountOut();
    void reconnectingToTheSameSiteKeepsTheAccount();
};

void TstUiConnect::anonymousUserCanInstallPublicGames()
{
    AppFixture a;
    QVERIFY(!a.vm->auth()->isAuthenticated());
    QTRY_COMPARE_WITH_TIMEOUT(a.vm->library()->count(), 2, 5000);
    a.vm->select("tetris");
    a.vm->primaryAction();
    QTRY_COMPARE_WITH_TIMEOUT(
        a.vm->selected().value("primaryKind").toString(), QString("play"),
        10000);
    for (const QString& head : a.http.heads)
        QVERIFY(!head.contains("Authorization", Qt::CaseInsensitive));
}

void TstUiConnect::switchingSiteSignsTheAccountOut()
{
    AppFixture a;
    a.http.routes["/api/auth/login"] = R"({"token":"jwt"})";
    QTRY_COMPARE_WITH_TIMEOUT(a.vm->library()->count(), 2, 5000);
    a.vm->auth()->login("alice", "pw", "acme");
    QTRY_VERIFY_WITH_TIMEOUT(a.vm->auth()->isAuthenticated(), 5000);
    QVERIFY(a.vm->connection()->connectTo("https://other.example", "acme"));
    QVERIFY(!a.vm->auth()->isAuthenticated());
    QVERIFY(a.vm->auth()->token().isEmpty());
}

void TstUiConnect::reconnectingToTheSameSiteKeepsTheAccount()
{
    AppFixture a;
    a.http.routes["/api/auth/login"] = R"({"token":"jwt"})";
    a.vm->auth()->login("alice", "pw", "acme");
    QTRY_VERIFY_WITH_TIMEOUT(a.vm->auth()->isAuthenticated(), 5000);
    QVERIFY(a.vm->connection()->connectTo(a.http.baseUrl(), "acme"));
    QVERIFY(a.vm->auth()->isAuthenticated());
}

QTEST_MAIN(TstUiConnect)
#include "qtst_UiConnect_2.moc"
