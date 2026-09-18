#include "domain/DeepLinkParser.h"

#include <QStringList>
#include <QUrl>

namespace Hypernucleus {

QString DeepLink::actionName() const
{
    switch (action) {
    case Action::Launch:
        return QStringLiteral("launch");
    case Action::Install:
        return QStringLiteral("install");
    default:
        return QString();
    }
}

} // namespace Hypernucleus
