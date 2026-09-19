#include "viewmodels/SelectedGameView.h"
#include "models/Constants.h"
#include "domain/VersionCompare.h"

#include <QCoreApplication>

namespace Hypernucleus {
namespace SelectedGameView {

namespace {
struct PrimaryText {
    Q_DECLARE_TR_FUNCTIONS(PrimaryText)
};

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
            return make("install", PrimaryText::tr("Install v%1").arg(selectedVersion));
        return make("play", PrimaryText::tr("Play"));
    case GameStates::UpdateAvailable:
        return make("update", PrimaryText::tr("Update"));
    case GameStates::Queued:
        return make("cancel", PrimaryText::tr("Queued"));
    case GameStates::Downloading:
        return make("cancel",
                    progress >= 0 ? PrimaryText::tr("Installing %1%")
                                        .arg(static_cast<int>(progress * 100))
                                  : PrimaryText::tr("Installing..."));
    case GameStates::Verifying:
        return make("cancel", PrimaryText::tr("Verifying..."));
    case GameStates::Installing:
        return make("cancel", PrimaryText::tr("Installing..."));
    case GameStates::Launching:
        return make("none", PrimaryText::tr("Launching..."), false);
    case GameStates::Running:
        return make("stop", PrimaryText::tr("Stop"));
    case GameStates::LaunchFailed:
        return make("play", PrimaryText::tr("Launch failed - Retry"));
    case GameStates::InstallFailed:
        return make("install", PrimaryText::tr("Install failed - Retry"));
    default:
        return make("install", PrimaryText::tr("Install"));
    }
}

} // namespace SelectedGameView
} // namespace Hypernucleus
