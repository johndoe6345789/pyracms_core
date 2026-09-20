#include "filters/FeatureGate.h"

#include "filters/FeatureCache.h"
#include "filters/FeatureRules.h"
#include "filters/TenantGuard.h"
#include "filters/TenantRules.h"
#include "security/HttpSecurity.h"

namespace pyracms {

static void dbLookup(int tenant, const std::string &feature,
                     std::function<void(bool)> cb) {
    bool cached = false;
    if (FeatureCache::instance().get(tenant, feature, cached)) {
        cb(cached);
        return;
    }
    drogon::app().getDbClient()->execSqlAsync(
        "SELECT value FROM settings WHERE tenant_id = $1 AND name = $2",
        [=](const drogon::orm::Result &r) {
            std::optional<std::string> v;
            if (!r.empty() && !r[0]["value"].isNull())
                v = r[0]["value"].as<std::string>();
            bool on = featureEnabled(v);
            FeatureCache::instance().put(tenant, feature, on);
            cb(on);
        },
        [cb](const drogon::orm::DrogonDbException &) { cb(true); }, tenant,
        "feature_" + feature);
}

FeatureLookup &featureLookup() {
    static FeatureLookup l = dbLookup;
    return l;
}

void featureGate(const drogon::HttpRequestPtr &req,
                 std::function<void(const drogon::HttpResponsePtr &)> &&deny,
                 std::function<void()> &&pass) {
    auto feature = featureOfPath(req->path());
    int tenant =
        feature.empty() ? 0 : firstNamedTenant(namedTenants(req));
    if (tenant == 0) {
        pass();
        return;
    }
    featureLookup()(tenant, feature,
                    [req, feature, deny = std::move(deny),
                     pass = std::move(pass)](bool on) {
                        if (on) {
                            pass();
                            return;
                        }
                        auto resp = filterError(
                            "This feature is turned off for this site",
                            drogon::k404NotFound);
                        (*resp->jsonObject())["feature"] = feature;
                        addCors(req, resp);
                        addSecurityHeaders(req, resp);
                        deny(resp);
                    });
}

void installFeatureGate(drogon::HttpAppFramework &app) {
    app.registerPreRoutingAdvice(
        [](const drogon::HttpRequestPtr &req,
           drogon::AdviceCallback &&deny,
           drogon::AdviceChainCallback &&pass) {
            featureGate(req, std::move(deny), std::move(pass));
        });
}

} // namespace pyracms
