#include <QtTest>
#include <QTemporaryDir>

#include "MiniHttp.h"
#include "ZipBuilder.h"
#include "domain/DownloadVerifier.h"
#include "services/ApiClient.h"
#include "services/DownloadManager.h"

using namespace Hypernucleus;

class TstDownloadManager : public QObject {
    Q_OBJECT
    using Req = DownloadManager::Request;

    static Req request(MiniHttp& http, const QString& dest,
                       const QByteArray& body, bool checks = true)
    {
        Req r;
        r.id = "job";
        r.url = QUrl(http.baseUrl() + "/f.bin");
        r.destPath = dest;
        if (checks) {
            r.expectedSize = body.size();
            r.expectedSha256 = QString::fromLatin1(
                QCryptographicHash::hash(body, QCryptographicHash::Sha256)
                    .toHex());
        }
        return r;
    }

private slots:
    void downloadsAndVerifies();
};

void TstDownloadManager::downloadsAndVerifies()
{
    MiniHttp http;
    const QByteArray body(50000, 'a');
    http.routes["/f.bin"] = body;
    ApiClient api;
    api.setBaseUrl(http.baseUrl());
    DownloadManager dm(&api);
    QTemporaryDir dir;
    const QString dest = dir.filePath("f.bin");
    QSignalSpy done(&dm, &DownloadManager::finished);
    QSignalSpy prog(&dm, &DownloadManager::progress);
    dm.start(request(http, dest, body));
    QTRY_COMPARE_WITH_TIMEOUT(done.count(), 1, 5000);
    QCOMPARE(readAll(dest), body);
    QVERIFY(prog.count() >= 1);
    QVERIFY(!QFileInfo::exists(dest + ".part"));
}

QTEST_MAIN(TstDownloadManager)
#include "qtst_DownloadManager.moc"
