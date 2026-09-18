#include "services/SingleInstance.h"

#include <QLocalServer>
#include <QLocalSocket>
#include <QPointer>
#include <QVariant>

namespace Hypernucleus {

void SingleInstance::onNewConnection()
{
    while (QLocalSocket* socket = m_server->nextPendingConnection()) {
        QPointer<QLocalSocket> guard(socket);
        connect(socket, &QLocalSocket::disconnected, socket,
                &QObject::deleteLater);
        connect(socket, &QLocalSocket::readyRead, this, [this, guard]() {
            if (!guard) return;
            QByteArray buffer = guard->property("buffer").toByteArray();
            buffer += guard->readAll();
            if (buffer.size() > kMaxMessageBytes + 1) { // + newline
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
