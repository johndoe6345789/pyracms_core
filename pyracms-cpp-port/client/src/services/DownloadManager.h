#pragma once

#include <QFile>
#include <QHash>
#include <QObject>
#include <QString>
#include <QUrl>

class QNetworkReply;

namespace Hypernucleus {

class ApiClient;

// Streams a URL into "<dest>.part", resumes with HTTP Range after an
// interruption, verifies size/sha256 when known and atomically renames to
// the destination. Cancelling or failing keeps the .part file so the next
// attempt continues where it stopped.
class DownloadManager : public QObject {
    Q_OBJECT

public:
    struct Request {
        QString id;
        QUrl url;
        QString destPath;
        qint64 expectedSize = 0;     // 0 = unknown
        QString expectedSha256;      // empty = unknown
    };

    explicit DownloadManager(ApiClient* api, QObject* parent = nullptr);
    ~DownloadManager() override;

    void start(const Request& request);
    void cancel(const QString& id);
    bool isActive(const QString& id) const;

signals:
    void started(const QString& id, qint64 resumedFrom);
    void progress(const QString& id, qint64 received, qint64 total);
    void verifying(const QString& id);
    void finished(const QString& id, const QString& path);
    void failed(const QString& id, const QString& error);
    void cancelled(const QString& id);

private:
    struct Job {
        Request req;
        QNetworkReply* reply = nullptr;
        QFile part;
        qint64 offset = 0;
        bool headerChecked = false;
        bool cancelled = false;
    };

    void onReadyRead(Job* job);
    void onFinished(Job* job);
    void complete(Job* job);
    void finishNow(const Request& req);
    void removeJob(const QString& id);

    ApiClient* m_api;
    QHash<QString, Job*> m_jobs;
};

} // namespace Hypernucleus
