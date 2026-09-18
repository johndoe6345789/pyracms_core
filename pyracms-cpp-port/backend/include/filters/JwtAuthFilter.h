#pragma once

#include "services/AuthService.h"

#include <drogon/HttpFilter.h>

namespace pyracms {

class JwtAuthFilter : public drogon::HttpFilter<JwtAuthFilter> {
  public:
    void doFilter(const drogon::HttpRequestPtr &req,
                  drogon::FilterCallback &&fcb,
                  drogon::FilterChainCallback &&fccb) override;

  private:
    AuthService authService_;
};

} // namespace pyracms
