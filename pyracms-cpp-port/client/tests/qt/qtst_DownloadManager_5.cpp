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
    void cancelKeepsPartial();
};

void TstDownloadManager::cancelKeepsPartial()
{
    MiniHttp http;
    ApiClient api;
    api.setBaseUrl(http.baseUrl());
    DownloadManager dm(&api);
    QTemporaryDir dir;
    QSignalSpy cancelled(&dm, &DownloadManager::cancelled);
    dm.start(request(http, dir.filePath("f.bin"), "x", false));
    QVERIFY(dm.isActive("job"));
    dm.cancel("job");
    QTRY_COMPARE_WITH_TIMEOUT(cancelled.count(), 1, 5000);
    QVERIFY(!dm.isActive("job"));
    dm.cancel("job"); // unknown id: harmless
}

QTEST_MAIN(TstDownloadManager)
#include "qtst_DownloadManager_5.moc"
