#include "viewmodels/SelectedGameView.h"
#include "domain/HnText.h"
#include "domain/BinarySelector.h"
#include "domain/Format.h"

#include <QCoreApplication>

namespace Hypernucleus {
namespace SelectedGameView {

void addStats(QVariantMap& m, const Input& in, const QString& version)
{
    const GameEntry& e = *in.entry;
    m["likes"] = e.likes;
    m["dislikes"] = e.dislikes;
    m["views"] = e.views;
    m["createdAt"] = e.createdAt.left(10);
    m["owner"] = e.owner;
    m["downloads"] = e.downloads;
    m["screenshotCount"] = e.screenshots.size();

    QString size;
    QString note;
    const RevisionInfo* rev = e.revision(version);
    if (rev) {
        const DownloadTarget t =
            BinarySelector::resolveTarget(*rev, e.type, in.os, in.arch);
        if (t.ok && t.size > 0) size = Format::bytes(t.size);
        if (t.ok && t.nativeBuild &&
            BinarySelector::emulatesX64(in.os, in.arch) &&
            !rev->binaries.isEmpty()) {
            const BinaryInfo* b =
                BinarySelector::pickBinary(rev->binaries, in.os, in.arch);
            if (b && BinarySelector::normalizeArch(b->arch) == "x86_64")
                note = HnText::tr("x86_64 build, runs emulated");
        }
    }
    m["downloadSize"] = size;
    m["downloadNote"] = note;
}

} // namespace SelectedGameView
} // namespace Hypernucleus
