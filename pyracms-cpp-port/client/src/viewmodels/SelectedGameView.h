#pragma once

#include "domain/GameEntry.h"
#include "domain/InstallStateStore.h"

#include <QColor>
#include <QVariantMap>
#include <functional>

namespace Hypernucleus {
namespace SelectedGameView {

struct Input {
    const GameEntry* entry = nullptr;
    InstallRecord record; // invalid when not installed
    int state = 0;        // GameStates::State
    double progress = 0.0;
    QString statusText;
    QString selectedVersion; // version chosen in the selector
    QColor accent;
    QString os;   // platform used to pick the build, e.g. "windows"
    QString arch; // e.g. "arm64"
    std::function<QString(const QString&)> mediaUrl; // ref -> absolute URL
};

// Everything the detail page needs, as one QVariantMap. The primary button
// (kind / label / enabled) is derived here so QML stays declarative.
//   primaryKind: install | update | play | stop | cancel | none
QVariantMap build(const Input& in);

// likes, views, owner, download count and the size of the build that would
// be downloaded on this platform (downloadSize / downloadNote).
void addStats(QVariantMap& m, const Input& in, const QString& version);

struct Primary {
    QString kind;
    QString label;
    bool enabled = true;
};
Primary primaryFor(int state, double progress, const QString& installedVersion,
                   const QString& selectedVersion);

// Published versions, newest first.
QStringList publishedVersions(const GameEntry& entry);

} // namespace SelectedGameView
} // namespace Hypernucleus
