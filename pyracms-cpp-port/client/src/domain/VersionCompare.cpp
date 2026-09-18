#include "domain/VersionCompare.h"

#include <QStringList>
#include <QRegularExpression>

namespace Hypernucleus {
namespace VersionCompare {

int compare(const QString& a, const QString& b)
{
    static const QRegularExpression sep(R"([.\-_+])");
    const QStringList pa = a.trimmed().split(sep, Qt::SkipEmptyParts);
    const QStringList pb = b.trimmed().split(sep, Qt::SkipEmptyParts);
    const int n = qMax(pa.size(), pb.size());
    for (int i = 0; i < n; ++i) {
        const QString sa = i < pa.size() ? pa.at(i) : QStringLiteral("0");
        const QString sb = i < pb.size() ? pb.at(i) : QStringLiteral("0");
        bool oka = false;
        bool okb = false;
        const qlonglong na = sa.toLongLong(&oka);
        const qlonglong nb = sb.toLongLong(&okb);
        if (oka && okb) {
            if (na != nb) return na < nb ? -1 : 1;
        } else if (sa != sb) {
            return sa < sb ? -1 : 1;
        }
    }
    return 0;
}

} // namespace VersionCompare
} // namespace Hypernucleus
