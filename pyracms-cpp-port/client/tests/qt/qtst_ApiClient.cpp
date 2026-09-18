#include <QtTest>
#include <QJsonDocument>
#include <QJsonObject>

#include "MiniHttp.h"
#include "services/ApiClient.h"

using namespace Hypernucleus;

class TstApiClient : public QObject {
    Q_OBJECT

private slots:
    void resolvesUrls();
    void authorizedRequestCarriesTokenAndTenant();
    void getJsonReportsSuccessAndFailure();
};

void TstApiClient::resolvesUrls()
{
    ApiClient api;
    api.setBaseUrl("https://x.example/");
    QCOMPARE(api.resolveUrl("/api/a").toString(),
             QString("https://x.example/api/a"));
    QCOMPARE(api.resolveUrl("api/a").toString(),
             QString("https://x.example/api/a"));
    QCOMPARE(api.resolveUrl("http://cdn/x.png").toString(),
             QString("http://cdn/x.png"));
}

void TstApiClient::authorizedRequestCarriesTokenAndTenant()
{
    ApiClient api;
    api.setToken("tok");
    api.setTenant("  acme ");
    QCOMPARE(api.tenant(), QString("acme"));
    const auto r = api.authorizedRequest(QUrl("http://h/x"));
    QCOMPARE(r.rawHeader("Authorization"), QByteArray("Bearer tok"));
    QVERIFY(r.rawHeader("X-Tenant").isEmpty()); // backend: body/JWT only
    api.clearToken();
    QVERIFY(api.authorizedRequest(QUrl("http://h/x"))
                .rawHeader("Authorization")
                .isEmpty());
}

void TstApiClient::getJsonReportsSuccessAndFailure()
{
    MiniHttp http;
    http.routes["/ok"] = R"({"a":1})";
    http.routes["/bad"] = "not json";
    http.routes["/err"] = R"({"error":"boom"})";
    http.statuses["/err"] = 500;
    ApiClient api;
    api.setBaseUrl(http.baseUrl());
    api.setTenant("acme");

    int state = 0;
    QString msg;
    auto cb = [&](bool ok, const QJsonDocument& d, int, const QString& e) {
        state = ok ? 1 : 2;
        msg = ok ? QString::number(d.object().value("a").toInt()) : e;
    };
    api.getJson("/ok", cb);
    QTRY_COMPARE_WITH_TIMEOUT(state, 1, 5000);
    QCOMPARE(msg, QString("1"));
    QVERIFY(!http.heads.last().contains("X-Tenant"));

    state = 0;
    api.getJson("/bad", cb);
    QTRY_COMPARE_WITH_TIMEOUT(state, 2, 5000);
    QVERIFY(msg.contains("Invalid JSON"));

    state = 0;
    api.getJson("/err", cb);
    QTRY_COMPARE_WITH_TIMEOUT(state, 2, 5000);
    QCOMPARE(msg, QString("boom")); // server's own error text
}

QTEST_MAIN(TstApiClient)
#include "qtst_ApiClient.moc"
