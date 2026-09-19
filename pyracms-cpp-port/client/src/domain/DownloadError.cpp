#include "domain/DownloadError.h"
#include "domain/HnText.h"

namespace Hypernucleus {
namespace DownloadError {

QString describe(int status, const QString& errorText, bool signedIn)
{
    if (status == 401 || status == 403) {
        return signedIn
                   ? HnText::tr("You do not have access to this game.")
                   : HnText::tr(
                         "This game is private - sign in to install.");
    }
    if (status > 0)
        return HnText::tr("HTTP %1: %2").arg(status).arg(errorText);
    return errorText;
}

} // namespace DownloadError
} // namespace Hypernucleus
