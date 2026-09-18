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
    void reusesVerifiedExistingFile();
    void notFoundKeepsNothing();
};

void TstDownloadManager::reusesVerifiedExistingFile()
{
    MiniHttp http;
    const QByteArray body(500, 'k');
    http.routes["/f.bin"] = body;
    ApiClient api;
    api.setBaseUrl(http.baseUrl());
    DownloadManager dm(&api);
    QTemporaryDir dir;
    const QString dest = dir.filePath("f.bin");
    QFile f(dest);
    QVERIFY(f.open(QIODevice::WriteOnly));
    f.write(body);
    f.close();
    QSignalSpy done(&dm, &DownloadManager::finished);
    dm.start(request(http, dest, body));
    QTRY_COMPARE_WITH_TIMEOUT(done.count(), 1, 5000);
    QVERIFY(http.paths.isEmpty()); // no request was made
}

void TstDownloadManager::notFoundKeepsNothing()
{
    MiniHttp http;
    ApiClient api;
    api.setBaseUrl(http.baseUrl());
    DownloadManager dm(&api);
    QTemporaryDir dir;
    QSignalSpy failed(&dm, &DownloadManager::failed);
    dm.start(request(http, dir.filePath("f.bin"), "x", false));
    QTRY_COMPARE_WITH_TIMEOUT(failed.count(), 1, 5000);
    QVERIFY(failed.at(0).at(1).toString().contains("404"));
    QVERIFY(!dm.isActive("job"));
}

QTEST_MAIN(TstDownloadManager)
#include "qtst_DownloadManager_4.moc"
