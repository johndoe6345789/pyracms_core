#pragma once

#include <QHash>
#include <QList>
#include <QObject>
#include <QTcpServer>
#include <QTcpSocket>

#include "MiniHttpReply.h"

// Tiny HTTP/1.1 server for tests: fixed bodies per path, honours Range,
// records request heads and bodies. POST to a known route answers 200.
class MiniHttp : public QObject {
public:
    explicit MiniHttp(QObject* parent = nullptr) : QObject(parent)
    {
        connect(&m_server, &QTcpServer::newConnection, this, [this]() {
            while (auto* s = m_server.nextPendingConnection())
                connect(s, &QTcpSocket::readyRead, this,
                        [this, s]() { onData(s); });
        });
        m_server.listen(QHostAddress::LocalHost);
    }

    QString baseUrl() const
    {
        return QString("http://127.0.0.1:%1").arg(m_server.serverPort());
    }
    QHash<QString, QByteArray> routes; // path -> body
    QHash<QString, int> statuses;      // path -> forced status code
    QList<QString> ranges, paths, heads, bodies;
    bool ignoreRange = false;

private:
    void onData(QTcpSocket* s)
    {
        m_buf[s] += s->readAll();
        const int end = m_buf[s].indexOf("\r\n\r\n");
        if (end < 0) return;
        const QString head = QString::fromLatin1(m_buf[s].left(end));
        const int len = head.section("Content-Length:", 1, 1,
                                     QString::SectionCaseInsensitiveSeps)
                            .section("\r\n", 0, 0)
                            .trimmed()
                            .toInt();
        if (m_buf[s].size() < end + 4 + len) return;
        bodies << QString::fromUtf8(m_buf[s].mid(end + 4, len));
        m_buf.remove(s);
        reply(s, head);
    }

    void reply(QTcpSocket* s, const QString& head)
    {
        const QString path = head.section(' ', 1, 1);
        QString range;
        for (const QString& line : head.split("\r\n"))
            if (line.startsWith("Range:", Qt::CaseInsensitive))
                range = line.mid(6).trimmed();
        paths << path;
        ranges << range;
        heads << head;
        s->write(miniHttpReply(routes.value(path), statuses.value(path, 0),
                               routes.contains(path), range, ignoreRange));
        s->disconnectFromHost();
    }

    QTcpServer m_server;
    QHash<QTcpSocket*, QByteArray> m_buf;
};
