#pragma once

#include "services/AuthService.h"

#include <drogon/HttpFilter.h>
#include <functional>
#include <optional>

namespace pyracms {

// Current server-side state of the account a token names.
struct UserState {
    int role{1};
    bool banned{false};
    int tenantId{0};
    long long validAfter{0}; // epoch s; tokens issued before are revoked
};

struct AuthVerdict {
    int status{0}; // 0 = accepted
    std::string message;
};

// Pure decision: may this (validly signed) token still be used?
AuthVerdict authVerdict(const TokenPayload &token, const UserState &state);

class JwtAuthFilter : public drogon::HttpFilter<JwtAuthFilter> {
  public:
    // nullopt state + ok=true means the account no longer exists;
    // ok=false means the lookup itself failed. Tests replace it.
    using StateCb = std::function<void(bool ok, std::optional<UserState>)>;
    using StateLookup = std::function<void(int userId, StateCb)>;
    static StateLookup &stateLookup();

    void doFilter(const drogon::HttpRequestPtr &req,
                  drogon::FilterCallback &&fcb,
                  drogon::FilterChainCallback &&fccb) override;

  private:
    AuthService authService_;
};

} // namespace pyracms
