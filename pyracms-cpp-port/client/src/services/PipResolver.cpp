#include "services/PipResolver.h"

#include <QNetworkAccessManager>
#include <QNetworkReply>
#include <QNetworkRequest>
#include <QRegularExpression>
#include <QSharedPointer>
#include <QTimer>
#include <QUrl>

namespace Hypernucleus {

PipResolver::PipResolver(QObject* parent)
    : QObject(parent), m_nam(new QNetworkAccessManager(this)),
      m_indexUrl(QStringLiteral("https://pypi.org/pypi"))
{
}

void PipResolver::setIndexUrl(const QString& base)
{
    QString b = base.trimmed();
    while (b.endsWith('/'))
        b.chop(1);
    m_indexUrl = b.isEmpty() ? QStringLiteral("https://pypi.org/pypi") : b;
    m_cache.clear();
}

QString PipResolver::normalizeName(const QString& name)
{
    static const QRegularExpression sep("[-_.]+");
    QString n = name.trimmed().toLower();
    n.replace(sep, "-");
    return n;
}

} // namespace Hypernucleus
