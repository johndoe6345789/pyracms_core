#include "viewmodels/SelectedGameView.h"
#include "models/Constants.h"
#include "domain/Format.h"
#include "domain/MediaRef.h"
#include "domain/VersionCompare.h"

#include <QCoreApplication>
#include <algorithm>

namespace Hypernucleus {
namespace SelectedGameView {

QVariantMap build(const Input& in)
{
    QVariantMap m;
    if (!in.entry) return m;
    const GameEntry& e = *in.entry;
    const auto media = [&](const QString& ref) {
        return in.mediaUrl ? in.mediaUrl(MediaRef::toPath(ref)) : ref;
    };

    QStringList shots;
    for (const QString& s : e.screenshots)
        shots << media(s);
    const QString coverRef =
        !e.hero.isEmpty()
            ? e.hero
            : (!e.screenshots.isEmpty() ? e.screenshots.first() : QString());

    const QStringList versions = publishedVersions(e);
    const QString latest = e.latestVersion();
    const bool installed = in.record.isValid();
    QString selected = in.selectedVersion;
    if (selected.isEmpty()) selected = installed ? in.record.version : latest;

    const Primary primary =
        primaryFor(in.state, in.progress, in.record.version, selected);
    const bool busyState =
        in.state == GameStates::Queued || in.state == GameStates::Downloading ||
        in.state == GameStates::Verifying ||
        in.state == GameStates::Installing ||
        in.state == GameStates::Launching || in.state == GameStates::Running;

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
    m["updateAvailable"] =
        installed && !latest.isEmpty() &&
        VersionCompare::compare(in.record.version, latest) < 0;
    m["state"] = in.state;
    m["progress"] = in.progress;
    m["statusText"] = in.statusText;
    m["primaryKind"] = primary.kind;
    m["primaryLabel"] = primary.label;
    m["primaryEnabled"] = primary.enabled;
    m["canUninstall"] = installed && !busyState;
    m["installPath"] = in.record.path;
    m["installSize"] =
        installed ? Format::bytes(in.record.sizeBytes) : QString();
    m["kind"] = in.record.kind;
    m["depCount"] = e.dependencies.size();
    addStats(m, in, selected);
    return m;
}

} // namespace SelectedGameView
} // namespace Hypernucleus
