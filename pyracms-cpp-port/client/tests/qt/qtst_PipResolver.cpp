#include <QtTest>

#include "MiniHttp.h"
#include "services/PipResolver.h"

using namespace Hypernucleus;

class TstPipResolver : public QObject {
    Q_OBJECT

private slots:
    void asksIndexAndCachesAnswers();
    void unreachableIndexMeansNotOnPip();
};

void TstPipResolver::asksIndexAndCachesAnswers()
{
    MiniHttp http;
    http.routes["/pypi/requests/json"] = "{}";
    PipResolver r;
    r.setIndexUrl(http.baseUrl() + "/pypi/");
    QCOMPARE(r.indexUrl(), http.baseUrl() + "/pypi");

    QMap<QString, bool> got;
    r.check({"Requests", "my_private_lib"},
            [&](const QMap<QString, bool>& m) { got = m; });
    QTRY_VERIFY_WITH_TIMEOUT(!got.isEmpty(), 5000);
    QVERIFY(got.value("Requests"));
    QVERIFY(!got.value("my_private_lib")); // 404: PyraCMS dependency
    const int asked = http.paths.size();

    QMap<QString, bool> again;
    r.check({"requests", "my-private-lib"},
            [&](const QMap<QString, bool>& m) { again = m; });
    QTRY_VERIFY_WITH_TIMEOUT(!again.isEmpty(), 5000);
    QVERIFY(again.value("requests"));
    QCOMPARE(http.paths.size(), asked); // served from the cache
}

void TstPipResolver::unreachableIndexMeansNotOnPip()
{
    PipResolver r;
    r.setIndexUrl("http://127.0.0.1:1/pypi");
    QMap<QString, bool> got;
    r.check({"anything"}, [&](const QMap<QString, bool>& m) { got = m; });
    QTRY_VERIFY_WITH_TIMEOUT(!got.isEmpty(), 9000);
    QVERIFY(!got.value("anything"));
}

QTEST_MAIN(TstPipResolver)
#include "qtst_PipResolver.moc"
