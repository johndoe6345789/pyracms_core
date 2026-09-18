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
    void resumesPartialFile();
};

void TstDownloadManager::resumesPartialFile()
{
    MiniHttp http;
    QByteArray body;
    for (int i = 0; i < 20000; ++i)
        body.append(char('a' + i % 26));
    http.routes["/f.bin"] = body;
    ApiClient api;
    api.setBaseUrl(http.baseUrl());
    DownloadManager dm(&api);
    QTemporaryDir dir;
    const QString dest = dir.filePath("f.bin");
    QFile part(dest + ".part");
    QVERIFY(part.open(QIODevice::WriteOnly));
    part.write(body.left(8000));
    part.close();

    QSignalSpy started(&dm, &DownloadManager::started);
    QSignalSpy done(&dm, &DownloadManager::finished);
    dm.start(request(http, dest, body));
    QTRY_COMPARE_WITH_TIMEOUT(done.count(), 1, 5000);
    QCOMPARE(started.at(0).at(1).toLongLong(), qint64(8000));
    QCOMPARE(http.ranges.value(0), QString("bytes=8000-"));
    QCOMPARE(readAll(dest), body);
}

QTEST_MAIN(TstDownloadManager)
#include "qtst_DownloadManager_2.moc"
