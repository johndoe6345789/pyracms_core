#pragma once

#include <QByteArray>
#include <QObject>
#include <QString>
#include <QUrl>
#include <functional>

class QNetworkAccessManager;

namespace Hypernucleus {

// Small anonymous GETs (release metadata, checksum lists). No PyraCMS
// credentials are ever attached: these go to third-party hosts.
class HttpFetcher : public QObject {
    Q_OBJECT

public:
    using Done = std::function<void(bool ok, const QByteArray& body,
                                    const QString& error)>;
    using QObject::QObject;
    virtual void get(const QUrl& url, Done done) = 0;
};

class NetworkFetcher : public HttpFetcher {
    Q_OBJECT

public:
    explicit NetworkFetcher(QNetworkAccessManager* nam,
                            QObject* parent = nullptr);
    void get(const QUrl& url, Done done) override;

private:
    QNetworkAccessManager* m_nam;
};

} // namespace Hypernucleus
