#include "services/SiteDirectory.h"

#include "domain/ServerUrl.h"
#include "services/ApiClient.h"

#include <QNetworkReply>
#include <QPointer>

namespace Hypernucleus {

SiteDirectory::SiteDirectory(ApiClient* api, QObject* parent)
    : QObject(parent), m_api(api)
{
}

QVariantList SiteDirectory::sites() const
{
    return TenantParser::toChoices(m_sites);
}

void SiteDirectory::finish(int generation, const QList<TenantInfo>& sites,
                           const QString& status)
{
    if (generation != m_generation) return; // superseded
    m_sites = sites;
    m_status = status;
    m_loading = false;
    emit changed();
}

void SiteDirectory::load(const QString& serverUrl)
{
    const int gen = ++m_generation;
    const QString base = ServerUrl::normalize(serverUrl);
    if (base.isEmpty()) {
        finish(gen, {}, tr("Enter a valid server address to list sites."));
        return;
    }
    m_loading = true;
    m_status = tr("Loading sites...");
    m_sites.clear();
    emit changed();

    QNetworkRequest request{QUrl(base + "/api/tenants")};
    request.setRawHeader("Accept", "application/json");
    QNetworkReply* reply = m_api->network()->get(request);
    QPointer<SiteDirectory> self(this);
    connect(reply, &QNetworkReply::finished, this, [self, reply, gen]() {
        reply->deleteLater();
        if (!self) return;
        if (reply->error() != QNetworkReply::NoError) {
            self->finish(gen, {},
                         tr("Could not reach the server (%1). You can "
                            "still type a site name.")
                             .arg(reply->errorString()));
            return;
        }
        const auto doc = QJsonDocument::fromJson(reply->readAll());
        const auto sites = TenantParser::parse(doc);
        self->finish(gen, sites,
                     sites.isEmpty() ? tr("This server lists no sites.")
                                     : QString());
    });
}

} // namespace Hypernucleus
