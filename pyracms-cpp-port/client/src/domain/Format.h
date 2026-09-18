#pragma once

#include <QString>

namespace Hypernucleus {
namespace Format {

inline QString bytes(qint64 n)
{
    if (n < 0)
        return QStringLiteral("?");
    const char* units[] = {"B", "KB", "MB", "GB", "TB"};
    double v = static_cast<double>(n);
    int u = 0;
    while (v >= 1024.0 && u < 4) {
        v /= 1024.0;
        ++u;
    }
    return u == 0 ? QStringLiteral("%1 B").arg(n)
                  : QStringLiteral("%1 %2").arg(v, 0, 'f', v < 10 ? 2 : 1).arg(QLatin1String(units[u]));
}

inline QString speed(double bytesPerSecond)
{
    return bytes(static_cast<qint64>(bytesPerSecond)) + QStringLiteral("/s");
}

} // namespace Format
} // namespace Hypernucleus
