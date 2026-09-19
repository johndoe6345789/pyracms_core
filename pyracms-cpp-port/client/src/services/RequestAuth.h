#pragma once

#include <QNetworkRequest>
#include <QString>

namespace Hypernucleus {
namespace RequestAuth {

// Adds "Authorization: Bearer <token>" only when a token is set, so the
// public catalog and public downloads work anonymously.
void apply(QNetworkRequest& request, const QString& token);

} // namespace RequestAuth
} // namespace Hypernucleus
