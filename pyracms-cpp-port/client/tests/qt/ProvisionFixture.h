#pragma once

#include <QCryptographicHash>
#include <QDir>
#include <QJsonArray>
#include <QTemporaryDir>

#include "Fixture.h"
#include "ProvisionFakes.h"
#include "MiniHttp.h"
#include "services/ApiClient.h"
#include "services/DownloadManager.h"
#include "services/PathManager.h"
#include "services/PythonProvisioner.h"

struct Provision {
    static constexpr const char* kName =
        "cpython-3.12.14+20260901-x86_64-unknown-linux-gnu-install_only.tar.gz";

    explicit Provision(bool goodSums = true, bool withSums = true)
        : body(20000, 'x'), paths(dir.path()), api(), dm(&api),
          prov(&paths, &fetch, &dm, &tar)
    {
        http.routes["/asset"] = body;
        prov.setPlatform("linux", "x86_64");
        QJsonObject rel = fixtureJson("pbs_release.json");
        QJsonArray assets;
        QString sumsUrl;
        for (const QJsonValue& v : rel.value("assets").toArray()) {
            QJsonObject a = v.toObject();
            if (a.value("name") == kName) {
                a["browser_download_url"] = http.baseUrl() + "/asset";
                a["size"] = body.size();
            }
            if (a.value("name") == "SHA256SUMS") {
                if (!withSums) continue;
                sumsUrl = a.value("browser_download_url").toString();
            }
            assets.append(a);
        }
        rel["assets"] = assets;
        fetch.bodies[Hypernucleus::PythonProvisioner::releaseUrl()] =
            QJsonDocument(rel).toJson();
        QByteArray hashed = goodSums ? body : QByteArray("other");
        const QString sha = QString::fromLatin1(
            QCryptographicHash::hash(hashed, QCryptographicHash::Sha256)
                .toHex());
        fetch.bodies[sumsUrl] = (sha + "  " + kName + "\n").toUtf8();
    }

    QTemporaryDir dir;
    QByteArray body;
    MiniHttp http;
    Hypernucleus::PathManager paths;
    Hypernucleus::ApiClient api;
    Hypernucleus::DownloadManager dm;
    FakeFetcher fetch;
    FakeTar tar;
    Hypernucleus::PythonProvisioner prov;
};
