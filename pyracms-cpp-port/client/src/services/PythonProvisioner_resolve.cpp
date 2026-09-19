#include "services/PythonProvisioner.h"
#include "services/HttpFetcher.h"

#include <QJsonArray>
#include <QJsonDocument>

namespace Hypernucleus {

void PythonProvisioner::resolve()
{
    if (isBusy()) return;
    const int gen = ++m_generation;
    m_asset = PythonAsset();
    setState(State::Resolving);
    m_http->get(m_releaseUrl, [this, gen](bool ok, const QByteArray& body,
                                          const QString& error) {
        if (gen != m_generation) return;
        const QJsonObject release = QJsonDocument::fromJson(body).object();
        if (!ok || release.isEmpty()) {
            fail(tr("Could not look up Python downloads: %1").arg(error));
            return;
        }
        m_asset = PythonAssets::pick(release, m_os, m_arch);
        if (!m_asset.isValid()) {
            fail(tr("There is no managed Python build for this system."));
            return;
        }
        fetchChecksums(release, gen);
    });
}

// The hash comes from the release's SHA256SUMS file; without one the
// download is refused.
void PythonProvisioner::fetchChecksums(const QJsonObject& release, int gen)
{
    QUrl sums;
    for (const QJsonValue& v : release.value("assets").toArray()) {
        const QJsonObject a = v.toObject();
        if (a.value("name").toString() == "SHA256SUMS")
            sums = QUrl(a.value("browser_download_url").toString());
    }
    if (sums.isEmpty()) {
        fail(tr("The Python release publishes no checksums."));
        return;
    }
    m_http->get(sums, [this, gen](bool ok, const QByteArray& body,
                                  const QString& error) {
        if (gen != m_generation) return;
        m_asset.sha256 = PythonAssets::shaFor(QString::fromUtf8(body),
                                              m_asset.name);
        if (!ok || m_asset.sha256.isEmpty()) {
            fail(tr("Could not verify the Python download: %1")
                     .arg(ok ? tr("no checksum for %1").arg(m_asset.name)
                             : error));
            return;
        }
        offerAsset();
    });
}

void PythonProvisioner::offerAsset()
{
    setState(State::Offered);
    emit offerReady(m_asset.version, m_asset.size);
}

} // namespace Hypernucleus
