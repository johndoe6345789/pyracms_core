#pragma once

#include <drogon/drogon.h>
#include <functional>
#include <string>

namespace pyracms {

// (tenant, feature id) -> enabled. Fails open (true) when unknown. The
// default reads the tenant's "feature_<id>" setting through FeatureCache;
// tests replace it.
using FeatureLookup =
    std::function<void(int tenant, const std::string &feature,
                       std::function<void(bool enabled)>)>;
FeatureLookup &featureLookup();

// Decides one request: exactly one of `deny` (404 JSON) or `pass` runs.
// The site is the one the request names (tenant_id / tenantId in query or
// body); a request naming none, or a non-gated path, always passes.
void featureGate(const drogon::HttpRequestPtr &req,
                 std::function<void(const drogon::HttpResponsePtr &)> &&deny,
                 std::function<void()> &&pass);

// Registers featureGate as a pre-routing advice.
void installFeatureGate(drogon::HttpAppFramework &app);

} // namespace pyracms
