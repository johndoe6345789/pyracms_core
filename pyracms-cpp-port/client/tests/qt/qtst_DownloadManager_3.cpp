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
    void restartsWhenServerIgnoresRange();
    void badChecksumFailsAndDropsPart();
};

void TstDownloadManager::restartsWhenServerIgnoresRange()
{
    MiniHttp http;
    http.ignoreRange = true;
    const QByteArray body(9000, 'z');
    http.routes["/f.bin"] = body;
    ApiClient api;
    api.setBaseUrl(http.baseUrl());
    DownloadManager dm(&api);
    QTemporaryDir dir;
    const QString dest = dir.filePath("f.bin");
    QFile part(dest + ".part");
    QVERIFY(part.open(QIODevice::WriteOnly));
    part.write(QByteArray(3000, 'z'));
    part.close();
    QSignalSpy done(&dm, &DownloadManager::finished);
    dm.start(request(http, dest, body));
    QTRY_COMPARE_WITH_TIMEOUT(done.count(), 1, 5000);
    QCOMPARE(readAll(dest), body); // not 12000 bytes
}

void TstDownloadManager::badChecksumFailsAndDropsPart()
{
    MiniHttp http;
    http.routes["/f.bin"] = QByteArray(1000, 'q');
    ApiClient api;
    api.setBaseUrl(http.baseUrl());
    DownloadManager dm(&api);
    QTemporaryDir dir;
    const QString dest = dir.filePath("f.bin");
    Req r = request(http, dest, QByteArray(1000, 'x')); // wrong sha
    QSignalSpy failed(&dm, &DownloadManager::failed);
    dm.start(r);
    QTRY_COMPARE_WITH_TIMEOUT(failed.count(), 1, 5000);
    QVERIFY(failed.at(0).at(1).toString().contains("Checksum"));
    QVERIFY(!QFileInfo::exists(dest));
    QVERIFY(!QFileInfo::exists(dest + ".part"));
}

QTEST_MAIN(TstDownloadManager)
#include "qtst_DownloadManager_3.moc"
