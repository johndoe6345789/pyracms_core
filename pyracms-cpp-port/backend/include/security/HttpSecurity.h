#pragma once

#include <drogon/drogon.h>
#include <string>

namespace pyracms {

// Allow-Origin value for a request: "" = no CORS headers.
// `allowedCsv` comes from CORS_ALLOWED_ORIGINS; empty means "*" (the API
// uses bearer tokens, never cookies, so a wildcard grants nothing extra).
std::string corsOriginFor(const std::string &allowedCsv,
                          const std::string &origin);

// Hardening headers for every API response (nosniff, framing, CSP,
// referrer, no-store; HSTS behind https).
void addSecurityHeaders(const drogon::HttpRequestPtr &req,
                        const drogon::HttpResponsePtr &resp);

// Cap for JSON / form bodies (multipart uploads have a larger cap).
constexpr size_t kMaxJsonBody = 2 * 1024 * 1024;

// Body-size, CORS preflight, header and error-handler wiring.
void installHttpSecurity(drogon::HttpAppFramework &app);

} // namespace pyracms
