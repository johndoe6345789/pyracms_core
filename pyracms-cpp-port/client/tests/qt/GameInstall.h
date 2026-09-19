#pragma once

#include <QtTest>

#include "MiniHttp.h"
#include "ZipBuilder.h"
#include "services/ApiClient.h"
#include "services/ModuleInstaller.h"
#include "services/PathManager.h"

using namespace Hypernucleus;

// Installs a tiny python game "g" through the real installer.
inline void installGame(ModuleInstaller& inst, MiniHttp& http,
                        const QString& zip)
{
    QVERIFY(buildZip(zip, {{"g/__init__.py", "def main(): pass"}}));
    http.routes["/g.zip"] = readAll(zip);
    DownloadTarget t;
    t.url = "/g.zip";
    t.ok = true;
    t.moduleType = "folder";
    QSignalSpy ok(&inst, &ModuleInstaller::installComplete);
    inst.install("g", "1.0", t.toJson(), "game");
    QTRY_COMPARE_WITH_TIMEOUT(ok.count(), 1, 5000);
}
