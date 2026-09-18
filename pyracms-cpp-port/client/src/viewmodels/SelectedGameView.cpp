#include "viewmodels/SelectedGameView.h"
#include "models/Constants.h"
#include "domain/Format.h"
#include "domain/MediaRef.h"
#include "domain/VersionCompare.h"

#include <QCoreApplication>
#include <algorithm>

namespace Hypernucleus {
namespace SelectedGameView {

namespace {
QString T(const char* text)
{
    return QCoreApplication::translate("SelectedGameView", text);
}
}

QStringList publishedVersions(const GameEntry& entry)
{
    QStringList versions;
    for (const RevisionInfo& r : entry.revisions)
        if (r.published && !r.version.isEmpty() && !versions.contains(r.version))
            versions << r.version;
    std::sort(versions.begin(), versions.end(), [](const QString& a, const QString& b) {
        return VersionCompare::compare(a, b) > 0;
    });
    return versions;
}

Primary primaryFor(int state, double progress, const QString& installedVersion,
                   const QString& selectedVersion)
{
    Primary p;
    switch (state) {
    case GameStates::Installed:
        if (!selectedVersion.isEmpty() && !installedVersion.isEmpty()
            && VersionCompare::compare(selectedVersion, installedVersion) != 0) {
            p.kind = "install";
            p.label = T("Install v%1").arg(selectedVersion);
        } else {
            p.kind = "play";
            p.label = T("Play");
        }
        break;
    case GameStates::UpdateAvailable:
        p.kind = "update";
        p.label = T("Update");
        break;
    case GameStates::Queued:
        p.kind = "cancel";
        p.label = T("Queued");
        break;
    case GameStates::Downloading:
        p.kind = "cancel";
        p.label = progress >= 0 ? T("Installing %1%").arg(static_cast<int>(progress * 100))
                                : T("Installing...");
        break;
    case GameStates::Verifying:
        p.kind = "cancel";
        p.label = T("Verifying...");
        break;
    case GameStates::Installing:
        p.kind = "cancel";
        p.label = T("Installing...");
        break;
    case GameStates::Launching:
        p.kind = "none";
        p.label = T("Launching...");
        p.enabled = false;
        break;
    case GameStates::Running:
        p.kind = "stop";
        p.label = T("Stop");
        break;
    case GameStates::LaunchFailed:
        p.kind = "play";
        p.label = T("Launch failed - Retry");
        break;
    case GameStates::InstallFailed:
        p.kind = "install";
        p.label = T("Install failed - Retry");
        break;
    case GameStates::NotInstalled:
    default:
        p.kind = "install";
        p.label = T("Install");
        break;
    }
    return p;
}

QVariantMap build(const Input& in)
{
    QVariantMap m;
    if (!in.entry)
        return m;
    const GameEntry& e = *in.entry;
    const auto media = [&](const QString& ref) {
        return in.mediaUrl ? in.mediaUrl(MediaRef::toPath(ref)) : ref;
    };

    QStringList shots;
    for (const QString& s : e.screenshots)
        shots << media(s);
    const QString coverRef = !e.hero.isEmpty() ? e.hero
        : (!e.screenshots.isEmpty() ? e.screenshots.first() : QString());

    const QStringList versions = publishedVersions(e);
    const QString latest = e.latestVersion();
    const bool installed = in.record.isValid();
    QString selected = in.selectedVersion;
    if (selected.isEmpty())
        selected = installed ? in.record.version : latest;

    const Primary primary = primaryFor(in.state, in.progress, in.record.version, selected);
    const bool busyState = in.state == GameStates::Queued || in.state == GameStates::Downloading
        || in.state == GameStates::Verifying || in.state == GameStates::Installing
        || in.state == GameStates::Launching || in.state == GameStates::Running;

    m["name"] = e.name;
    m["title"] = e.title();
    m["description"] = e.description;
    m["tags"] = e.tags;
    m["screenshots"] = shots;
    m["cover"] = coverRef.isEmpty() ? QString() : media(coverRef);
    m["accent"] = in.accent;
    m["detailLoaded"] = e.detailLoaded;
    m["versions"] = versions;
    m["selectedVersion"] = selected;
    m["installedVersion"] = in.record.version;
    m["latestVersion"] = latest;
    m["installed"] = installed;
    m["updateAvailable"] = installed && !latest.isEmpty()
        && VersionCompare::compare(in.record.version, latest) < 0;
    m["state"] = in.state;
    m["progress"] = in.progress;
    m["statusText"] = in.statusText;
    m["primaryKind"] = primary.kind;
    m["primaryLabel"] = primary.label;
    m["primaryEnabled"] = primary.enabled;
    m["canUninstall"] = installed && !busyState;
    m["installPath"] = in.record.path;
    m["installSize"] = installed ? Format::bytes(in.record.sizeBytes) : QString();
    m["kind"] = in.record.kind;
    m["depCount"] = e.dependencies.size();
    m["likes"] = e.likes;
    m["dislikes"] = e.dislikes;
    m["views"] = e.views;
    m["createdAt"] = e.createdAt.left(10);
    return m;
}

} // namespace SelectedGameView
} // namespace Hypernucleus
