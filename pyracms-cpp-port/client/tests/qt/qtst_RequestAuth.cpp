#include <QtTest>
#include <QTemporaryDir>

#include "DownloadJob.h"
#include "MiniHttp.h"
#include "services/ApiClient.h"
#include "services/DownloadManager.h"
#include "services/RequestAuth.h"

using namespace Hypernucleus;

class TstAnonymousAccess : public QObject {
    Q_OBJECT

private slots:
    void bearerHeaderOnlyWithToken();
    void catalogRequestWithoutTokenHasNoAuthorization();
    void catalogRequestWithTokenIsAuthorized();
};

void TstAnonymousAccess::bearerHeaderOnlyWithToken()
{
    QNetworkRequest r{QUrl("http://h/x")};
    RequestAuth::apply(r, QString());
    QVERIFY(!r.hasRawHeader("Authorization"));
    RequestAuth::apply(r, "tok");
    QCOMPARE(r.rawHeader("Authorization"), QByteArray("Bearer tok"));
}

void TstAnonymousAccess::catalogRequestWithoutTokenHasNoAuthorization()
{
    MiniHttp http;
    http.routes["/api/gamedep/catalog"] = "{}";
    ApiClient api;
    api.setBaseUrl(http.baseUrl());
    QVERIFY(!api.hasToken());
    QVERIFY(!api.authorizedRequest(QUrl("http://h/x"))
                 .hasRawHeader("Authorization"));
    bool done = false;
    api.getJson("/api/gamedep/catalog",
                [&](bool, const QJsonDocument&, int, const QString&) {
                    done = true;
                });
    QTRY_VERIFY_WITH_TIMEOUT(done, 5000);
    QVERIFY(!dlSentAuth(http));
}

void TstAnonymousAccess::catalogRequestWithTokenIsAuthorized()
{
    MiniHttp http;
    http.routes["/api/gamedep/catalog"] = "{}";
    ApiClient api;
    api.setBaseUrl(http.baseUrl());
    api.setToken("tok");
    bool done = false;
    api.getJson("/api/gamedep/catalog",
                [&](bool, const QJsonDocument&, int, const QString&) {
                    done = true;
                });
    QTRY_VERIFY_WITH_TIMEOUT(done, 5000);
    QVERIFY(dlSentAuth(http));
}

QTEST_MAIN(TstAnonymousAccess)
#include "qtst_RequestAuth.moc"
