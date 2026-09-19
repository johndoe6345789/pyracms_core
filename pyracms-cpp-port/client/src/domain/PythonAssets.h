#pragma once

#include <QJsonObject>
#include <QString>

namespace Hypernucleus {

// One python-build-standalone download.
struct PythonAsset {
    QString name;    // cpython-3.12.14+2026...-x86_64-...-install_only.tar.gz
    QString url;     // browser_download_url
    QString version; // 3.12.14
    QString sha256;  // filled from the release's SHA256SUMS
    qint64 size = 0;

    bool isValid() const { return !name.isEmpty() && !url.isEmpty(); }
    bool isZip() const { return name.endsWith(".zip"); }
};

namespace PythonAssets {

// Rust target triple used in the asset names, empty if unsupported.
// os: windows | macos | linux (any spelling BinarySelector knows).
QString triple(const QString& os, const QString& arch);

// The newest `<minor>.x` "install_only" build for this OS / architecture in
// a GitHub release document (GET .../releases/latest), or an invalid asset.
PythonAsset pick(const QJsonObject& release, const QString& os,
                 const QString& arch, const QString& minor = "3.12");

// Hash of `assetName` in the text of a SHA256SUMS file ("<hex>  <name>").
QString shaFor(const QString& sums, const QString& assetName);

} // namespace PythonAssets
} // namespace Hypernucleus
