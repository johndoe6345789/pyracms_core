#include "domain/ServerUrl.h"

#include <QUrl>

namespace Hypernucleus {
namespace ServerUrl {

QStringList presets()
{
    return {QStringLiteral("http://localhost:3199"),
            QStringLiteral("https://pyracms.pynguins.xyz")};
}

QString normalize(const QString& text)
{
    QString s = text.trimmed();
    while (s.endsWith('/'))
        s.chop(1);
    const QUrl url(s, QUrl::StrictMode);
    const bool web = url.scheme() == "http" || url.scheme() == "https";
    if (!url.isValid() || !web || url.host().isEmpty()) return QString();
    if (!url.userInfo().isEmpty() || url.hasQuery() || url.hasFragment())
        return QString();
    return url.toString(QUrl::StripTrailingSlash); // lower-cased host
}

QString error(const QString& text)
{
    if (text.trimmed().isEmpty()) return QStringLiteral("Enter a server URL");
    if (!normalize(text).isEmpty()) return QString();
    return QStringLiteral(
        "Use a full address such as https://games.example.com");
}

static bool contains(const QStringList& list, const QString& url)
{
    return list.contains(url, Qt::CaseInsensitive);
}

QStringList remember(const QStringList& recent, const QString& url)
{
    const QString norm = normalize(url);
    if (norm.isEmpty()) return recent;
    QStringList out{norm};
    for (const QString& r : recent)
        if (!contains(out, r)) out.append(r);
    while (out.size() > MaxRecent)
        out.removeLast();
    return out;
}

QStringList choices(const QStringList& recent)
{
    QStringList out = presets();
    for (const QString& r : recent)
        if (!contains(out, r)) out.append(r);
    return out;
}

} // namespace ServerUrl
} // namespace Hypernucleus
