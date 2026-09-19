#pragma once

#include <QString>

namespace Hypernucleus {
namespace DownloadError {

// User-facing text for a failed download. 401/403 mean the content is not
// public: anonymous users are asked to sign in, signed-in ones are told
// they have no access. `errorText` is the transport error, if any.
QString describe(int status, const QString& errorText, bool signedIn);

} // namespace DownloadError
} // namespace Hypernucleus
