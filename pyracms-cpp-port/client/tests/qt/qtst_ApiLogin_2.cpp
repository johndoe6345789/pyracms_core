#include <QtTest>
#include <QJsonDocument>
#include <QJsonObject>

#include "MiniHttp.h"
#include "services/ApiClient.h"

using namespace Hypernucleus;

class TstApiLogin : public QObject {
    Q_OBJECT

private slots:
    void registerCarriesTenant();
    void tenantChangesEmitOnce();
};

void TstApiLogin::registerCarriesTenant()
{
    MiniHttp http;
    http.routes["/api/auth/register"] = R"({"message":"welcome"})";
    ApiClient api;
    api.setBaseUrl(http.baseUrl());
    api.setTenant("acme");
    QSignalSpy resp(&api, &ApiClient::registerResponse);
    api.registerUser("bob", "b@x.io", "pw");
    QTRY_COMPARE_WITH_TIMEOUT(resp.count(), 1, 5000);
    QCOMPARE(resp.at(0).at(1).toString(), QString("welcome"));
    const auto body = QJsonDocument::fromJson(http.bodies.last().toUtf8());
    QCOMPARE(body.object().value("tenant").toString(), QString("acme"));
}

void TstApiLogin::tenantChangesEmitOnce()
{
    ApiClient api;
    QSignalSpy sig(&api, &ApiClient::tenantChanged);
    api.setTenant("a");
    api.setTenant("a");
    api.setTenant(" a ");
    QCOMPARE(sig.count(), 1);
}

QTEST_MAIN(TstApiLogin)
#include "qtst_ApiLogin_2.moc"
