#include "domain/DeepLinkParser.h"

#include <QStringList>
#include <QUrl>

namespace Hypernucleus {

QString DeepLink::actionName() const
{
    switch (action) {
    case Action::Launch: return QStringLiteral("launch");
    case Action::Install: return QStringLiteral("install");
    default: return QString();
    }
}

namespace DeepLinkParser {

namespace {

bool isSafeSegment(const QString& s)
{
    if (s.isEmpty() || s.size() > 128 || s == "." || s == "..")
        return false;
    for (const QChar c : s) {
        if (c == '/' || c == '\\' || c.unicode() < 0x20 || c.unicode() == 0x7f)
            return false;
    }
    return !s.contains("..");
}

DeepLink fail(const QString& why)
{
    DeepLink l;
    l.error = why;
    return l;
}

} // namespace

DeepLink parse(const QString& url)
{
    const QUrl u(url.trimmed(), QUrl::StrictMode);
    if (!u.isValid())
        return fail(QStringLiteral("Malformed URL"));
    if (u.scheme().toLower() != "pyracms")
        return fail(QStringLiteral("Unsupported scheme"));

    DeepLink link;
    const QString host = u.host().toLower();
    if (host == "launch")
        link.action = DeepLink::Action::Launch;
    else if (host == "install")
        link.action = DeepLink::Action::Install;
    else
        return fail(QStringLiteral("Unknown action '%1'").arg(host));

    // Split the still-encoded path so an encoded slash cannot smuggle in
    // an extra segment: each part is decoded on its own afterwards.
    QString path = u.path(QUrl::FullyEncoded);
    if (path.endsWith('/'))
        path.chop(1);
    const QStringList parts = path.split('/', Qt::SkipEmptyParts);
    if (parts.size() != 2)
        return fail(QStringLiteral("Expected pyracms://%1/<slug>/<name>").arg(host));

    link.slug = QUrl::fromPercentEncoding(parts.at(0).toUtf8());
    link.name = QUrl::fromPercentEncoding(parts.at(1).toUtf8());
    if (!isSafeSegment(link.slug) || !isSafeSegment(link.name)) {
        link.action = DeepLink::Action::None;
        return fail(QStringLiteral("Invalid site or game name"));
    }
    return link;
}

QString build(DeepLink::Action action, const QString& slug, const QString& name)
{
    DeepLink tmp;
    tmp.action = action;
    return QStringLiteral("pyracms://%1/%2/%3")
        .arg(tmp.actionName(),
             QString::fromUtf8(QUrl::toPercentEncoding(slug)),
             QString::fromUtf8(QUrl::toPercentEncoding(name)));
}

QString findInArguments(const QStringList& args)
{
    for (const QString& a : args) {
        if (a.startsWith("pyracms:", Qt::CaseInsensitive))
            return a;
    }
    return {};
}

} // namespace DeepLinkParser
} // namespace Hypernucleus
