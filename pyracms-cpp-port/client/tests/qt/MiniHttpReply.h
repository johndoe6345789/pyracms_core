#pragma once

#include <QByteArray>
#include <QString>

// Builds the raw HTTP/1.1 response MiniHttp writes for one request.
// forced: status override (0 = none); known: path has a route.
inline QByteArray miniHttpReply(const QByteArray& body, int forced,
                                bool known, const QString& range,
                                bool ignoreRange)
{
    if (forced || !known) {
        const int code = forced ? forced : 404;
        return "HTTP/1.1 " + QByteArray::number(code) +
               " X\r\nContent-Length: " + QByteArray::number(body.size()) +
               "\r\nConnection: close\r\n\r\n" + body;
    }
    qint64 from = 0;
    if (range.startsWith("bytes=") && !ignoreRange)
        from = range.mid(6).section('-', 0, 0).toLongLong();
    QByteArray out = from > 0 ? "HTTP/1.1 206 Partial Content\r\n"
                              : "HTTP/1.1 200 OK\r\n";
    out += "Content-Length: " + QByteArray::number(body.size() - from);
    out += "\r\nConnection: close\r\n\r\n";
    return out + body.mid(from);
}
