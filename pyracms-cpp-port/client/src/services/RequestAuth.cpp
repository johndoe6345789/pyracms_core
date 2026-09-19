#include "services/RequestAuth.h"

namespace Hypernucleus {
namespace RequestAuth {

void apply(QNetworkRequest& request, const QString& token)
{
    if (token.isEmpty()) return;
    request.setRawHeader("Authorization", ("Bearer " + token).toUtf8());
}

} // namespace RequestAuth
} // namespace Hypernucleus
