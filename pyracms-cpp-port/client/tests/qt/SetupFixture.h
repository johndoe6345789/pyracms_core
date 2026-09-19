#pragma once

#include <QCryptographicHash>

#include "MiniHttp.h"
#include "PlannerFixture.h"
#include "TestEnv.h"
#include "ZipBuilder.h"
#include "services/GameManager.h"
#include "services/InstallRunner.h"
#include "services/PipInstaller.h"
#include "services/PythonProvisioner.h"
#include "services/SettingsManager.h"
#include "viewmodels/DownloadCenter.h"
#include "viewmodels/PythonSetup.h"

using namespace Hypernucleus;

// The consent prompt, the DownloadCenter progress and the retry, end to end
// against a local "GitHub" serving a zip build of Python.
#ifdef Q_OS_WIN
static const char* kExe = "python/python.exe";
#else
static const char* kExe = "python/bin/python3";
#endif

struct SetupFixture {
    SetupFixture()
        : pip(&f.paths), runner(&f.inst, &pip), center(&f.planner, &runner),
          games(&f.paths, &f.inst),
          setup(&f.paths, &f.api, &settings, &pip, &games, &center)
    {
        settings.setOsName("linux");
        settings.setArchName("x86_64");
        const QString name =
            "cpython-3.12.9+20250101-x86_64-unknown-linux-gnu-install_only.zip";
        const QString exe = kExe;
        buildZip(f.dir.filePath("py.zip"), {{exe, "#!fake"}});
        const QByteArray zip = readAll(f.dir.filePath("py.zip"));
        const QString base = http.baseUrl();
        http.routes["/release"] = QString(
            R"({"assets":[{"name":"%1","size":%2,"browser_download_url":
            "%3/py.zip"},{"name":"SHA256SUMS","size":1,
            "browser_download_url":"%3/sums"}]})")
            .arg(name).arg(zip.size()).arg(base).toUtf8();
        http.routes["/py.zip"] = zip;
        http.routes["/sums"] = (QCryptographicHash::hash(
            zip, QCryptographicHash::Sha256).toHex() + "  " + name.toUtf8()
            + "\n");
        setup.provisioner()->setReleaseUrl(QUrl(base + "/release"));
    }
    TestEnv env;
    MiniHttp http;
    PlannerFixture f;
    SettingsManager settings;
    PipInstaller pip;
    InstallRunner runner;
    DownloadCenter center;
    GameManager games;
    PythonSetup setup;
};

