#include "services/SingleInstance.h"

#include <QLocalServer>
#include <QLocalSocket>
#include <QPointer>

namespace Hypernucleus {

SingleInstance::SingleInstance(const QString& key, QObject* parent)
    : QObject(parent)
    , m_key(key)
{
}

QString SingleInstance::defaultKey()
{
    QString user = qEnvironmentVariable("USERNAME");
    if (user.isEmpty())
        user = qEnvironmentVariable("USER");
    if (user.isEmpty())
        user = QStringLiteral("default");
    return QStringLiteral("pyracms-hypernucleus-") + user;
}

bool SingleInstance::isPrimary() const
{
    return m_server && m_server->isListening();
}

bool SingleInstance::sendToPrimary(const QString& message, int timeoutMs)
{
    QLocalSocket socket;
    socket.connectToServer(m_key);
    if (!socket.waitForConnected(timeoutMs))
        return false;
    QByteArray payload = message.toUtf8().left(kMaxMessageBytes);
    payload.append('\n');
    socket.write(payload);
    const bool ok = socket.waitForBytesWritten(timeoutMs);
    socket.disconnectFromServer();
    if (socket.state() != QLocalSocket::UnconnectedState)
        socket.waitForDisconnected(timeoutMs);
    return ok;
}

bool SingleInstance::listenAsPrimary()
{
    if (!m_server) {
        m_server = new QLocalServer(this);
        m_server->setSocketOptions(QLocalServer::UserAccessOption);
        connect(m_server, &QLocalServer::newConnection,
                this, &SingleInstance::onNewConnection);
    }
    if (m_server->listen(m_key))
        return true;
    // Nobody answered in sendToPrimary(), so the socket file is stale.
    QLocalServer::removeServer(m_key);
    return m_server->listen(m_key);
}

void SingleInstance::onNewConnection()
{
    while (QLocalSocket* socket = m_server->nextPendingConnection()) {
        QPointer<QLocalSocket> guard(socket);
        connect(socket, &QLocalSocket::disconnected, socket, &QObject::deleteLater);
        connect(socket, &QLocalSocket::readyRead, this, [this, guard]() {
            if (!guard)
                return;
            QByteArray buffer = guard->property("buffer").toByteArray();
            buffer += guard->readAll();
            if (buffer.size() > kMaxMessageBytes) {
                guard->abort();
                return;
            }
            const int nl = buffer.indexOf('\n');
            if (nl < 0) {
                guard->setProperty("buffer", buffer);
                return;
            }
            guard->setProperty("buffer", QByteArray());
            emit messageReceived(QString::fromUtf8(buffer.left(nl)).trimmed());
        });
    }
}

} // namespace Hypernucleus
