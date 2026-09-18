#pragma once

#include <QString>
#include <QUrl>

namespace Hypernucleus {
namespace MediaRef {

// Turn a screenshot / banner reference into a server path or URL:
//   "https://..." and "/api/..." stay as they are,
//   anything else is treated as a file uuid or id -> "/api/files/<ref>".
inline QString toPath(const QString& ref)
{
    const QString r = ref.trimmed();
    if (r.isEmpty())
        return {};
    if (r.startsWith("http://") || r.startsWith("https://") || r.startsWith('/'))
        return r;
    return QStringLiteral("/api/files/") + QString::fromLatin1(QUrl::toPercentEncoding(r));
}

} // namespace MediaRef
} // namespace Hypernucleus
