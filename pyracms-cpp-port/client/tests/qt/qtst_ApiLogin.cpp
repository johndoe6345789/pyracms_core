#include <QtTest>
#include <QJsonDocument>
#include <QJsonObject>

#include "MiniHttp.h"
#include "services/ApiClient.h"

using namespace Hypernucleus;

class TstApiLogin : public QObject {
    Q_OBJECT

private slots:
    void loginSendsTenantInBodyAndReturnsToken();
    void loginWithoutTokenFails();
    void unauthorizedGetsFriendlyMessage();
    void serverErrorTextIsShown();
};

void TstApiLogin::loginSendsTenantInBodyAndReturnsToken()
{
    MiniHttp http;
    http.routes["/api/auth/login"] = R"({"token":"jwt-123"})";
    ApiClient api;
    api.setBaseUrl(http.baseUrl());
    QSignalSpy resp(&api, &ApiClient::loginResponse);
    api.loginWithTenant("alice", "pw", "acme");
    QTRY_COMPARE_WITH_TIMEOUT(resp.count(), 1, 5000);
    QVERIFY(resp.at(0).at(0).toBool());
    QCOMPARE(resp.at(0).at(1).toString(), QString("jwt-123"));
    const auto body =
        QJsonDocument::fromJson(http.bodies.last().toUtf8()).object();
    QCOMPARE(body.value("username").toString(), QString("alice"));
    QCOMPARE(body.value("password").toString(), QString("pw"));
    QCOMPARE(body.value("tenant").toString(), QString("acme"));
    QCOMPARE(api.tenant(), QString("acme"));
}

void TstApiLogin::loginWithoutTokenFails()
{
    MiniHttp http;
    http.routes["/api/auth/login"] = R"({"user":{}})";
    ApiClient api;
    api.setBaseUrl(http.baseUrl());
    QSignalSpy resp(&api, &ApiClient::loginResponse);
    api.login("a", "b");
    QTRY_COMPARE_WITH_TIMEOUT(resp.count(), 1, 5000);
    QVERIFY(!resp.at(0).at(0).toBool());
    QVERIFY(resp.at(0).at(1).toString().contains("No token"));
}

void TstApiLogin::unauthorizedGetsFriendlyMessage()
{
    MiniHttp http;
    http.statuses["/api/auth/login"] = 401;
    ApiClient api;
    api.setBaseUrl(http.baseUrl());
    QSignalSpy resp(&api, &ApiClient::loginResponse);
    api.loginWithTenant("a", "b", "acme");
    QTRY_COMPARE_WITH_TIMEOUT(resp.count(), 1, 5000);
    QVERIFY(resp.at(0).at(1).toString().contains("site"));
}

void TstApiLogin::serverErrorTextIsShown()
{
    MiniHttp http;
    http.routes["/api/auth/login"] = R"({"error":"tenant disabled"})";
    http.statuses["/api/auth/login"] = 403;
    ApiClient api;
    api.setBaseUrl(http.baseUrl());
    QSignalSpy resp(&api, &ApiClient::loginResponse);
    api.loginWithTenant("a", "b", "acme");
    QTRY_COMPARE_WITH_TIMEOUT(resp.count(), 1, 5000);
    QCOMPARE(resp.at(0).at(1).toString(), QString("tenant disabled"));
}

QTEST_MAIN(TstApiLogin)
#include "qtst_ApiLogin.moc"
