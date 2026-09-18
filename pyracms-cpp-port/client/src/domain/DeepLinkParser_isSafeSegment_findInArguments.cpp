#include "domain/DeepLinkParser.h"

#include <QStringList>
#include <QUrl>


namespace Hypernucleus {
namespace DeepLinkParser {

QString findInArguments(const QStringList& args)
{
    for (const QString& a : args) {
        if (a.startsWith("pyracms:", Qt::CaseInsensitive)) return a;
    }
    return {};
}

} // namespace DeepLinkParser
} // namespace Hypernucleus
