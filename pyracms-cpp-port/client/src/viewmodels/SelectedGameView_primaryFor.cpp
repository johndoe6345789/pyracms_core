#include "viewmodels/SelectedGameView.h"
#include "models/Constants.h"
#include "domain/VersionCompare.h"

#include <QCoreApplication>

namespace Hypernucleus {
namespace SelectedGameView {

namespace {
QString T(const char* text)
{
    return QCoreApplication::translate("SelectedGameView", text);
}

Primary make(const char* kind, const QString& label, bool enabled = true)
{
    Primary p;
    p.kind = kind;
    p.label = label;
    p.enabled = enabled;
    return p;
}
} // namespace

Primary primaryFor(int state, double progress, const QString& installedVersion,
                   const QString& selectedVersion)
{
    switch (state) {
    case GameStates::Installed:
        if (!selectedVersion.isEmpty() && !installedVersion.isEmpty() &&
            VersionCompare::compare(selectedVersion, installedVersion) != 0)
            return make("install", T("Install v%1").arg(selectedVersion));
        return make("play", T("Play"));
    case GameStates::UpdateAvailable:
        return make("update", T("Update"));
    case GameStates::Queued:
        return make("cancel", T("Queued"));
    case GameStates::Downloading:
        return make("cancel",
                    progress >= 0 ? T("Installing %1%")
                                        .arg(static_cast<int>(progress * 100))
                                  : T("Installing..."));
    case GameStates::Verifying:
        return make("cancel", T("Verifying..."));
    case GameStates::Installing:
        return make("cancel", T("Installing..."));
    case GameStates::Launching:
        return make("none", T("Launching..."), false);
    case GameStates::Running:
        return make("stop", T("Stop"));
    case GameStates::LaunchFailed:
        return make("play", T("Launch failed - Retry"));
    case GameStates::InstallFailed:
        return make("install", T("Install failed - Retry"));
    default:
        return make("install", T("Install"));
    }
}

} // namespace SelectedGameView
} // namespace Hypernucleus
