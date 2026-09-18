#pragma once

#include <QByteArray>
#include <QObject>
#include <QString>

class QLocalServer;

namespace Hypernucleus {

// One running launcher per user. A second start forwards its command line
// (a pyracms:// URL, or "focus") to the first one through a local socket
// (QLocalServer / QLocalSocket) and exits.
class SingleInstance : public QObject {
    Q_OBJECT

public:
    explicit SingleInstance(const QString& key = defaultKey(), QObject* parent = nullptr);

    static QString defaultKey();
    static constexpr int kMaxMessageBytes = 8192;

    // Try to hand `message` to an already running primary instance.
    bool sendToPrimary(const QString& message, int timeoutMs = 1500);
    // Become the primary instance. Removes a stale socket left by a crash.
    bool listenAsPrimary();
    bool isPrimary() const;

signals:
    void messageReceived(const QString& message);

private:
    void onNewConnection();

    QString m_key;
    QLocalServer* m_server = nullptr;
};

} // namespace Hypernucleus
