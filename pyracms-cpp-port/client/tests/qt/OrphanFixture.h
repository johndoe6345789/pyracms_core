#pragma once

#include <QtTest>

#include "MiniHttp.h"
#include "ZipBuilder.h"
#include "services/ApiClient.h"
#include "services/ModuleInstaller.h"
#include "services/PathManager.h"

using namespace Hypernucleus;

inline QJsonObject orphanTarget(const QString& file)
{
    DownloadTarget t;
    t.url = file;
    t.moduleType = "folder";
    t.ok = true;
    return t.toJson();
}

// Installs a one-file module `name` of `type` ("game" | "dep") over HTTP.
inline void put(ModuleInstaller& inst, MiniHttp& http, const QString& zipPath,
                const QString& name, const char* type)
{
    QVERIFY(buildZip(zipPath, {{name + "/a.py", "1"}}));
    http.routes["/" + name] = readAll(zipPath);
    QSignalSpy ok(&inst, &ModuleInstaller::installComplete);
    inst.install(name, "1", orphanTarget("/" + name), type);
    QTRY_COMPARE_WITH_TIMEOUT(ok.count(), 1, 5000);
}
