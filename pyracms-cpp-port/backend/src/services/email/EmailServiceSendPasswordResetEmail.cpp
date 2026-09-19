#include "services/EmailService.h"
#include "services/email/EmailServiceInternal.h"

#include <cctype>
#include <cstring>
#include <curl/curl.h>
#include <sstream>

namespace pyracms {

void EmailService::sendPasswordResetEmail(const std::string &to,
                                          const std::string &token,
                                          const std::string &tenantSlug,
                                          BoolCallback cb) {
    sendEmail(to, "Password Reset - PyraCMS",
              fillBaseUrl(passwordResetEmailTemplate(
                  resetLink(token, tenantSlug))),
              std::move(cb));
}

static std::string urlEncode(const std::string &v) {
    static const char *hex = "0123456789ABCDEF";
    std::string out;
    for (unsigned char c : v) {
        if (std::isalnum(c) || c == '-' || c == '_' || c == '.' || c == '~') {
            out += static_cast<char>(c);
        } else {
            out += '%';
            out += hex[c >> 4];
            out += hex[c & 15];
        }
    }
    return out;
}

std::string EmailService::resetLink(const std::string &token,
                                    const std::string &tenantSlug) {
    auto link = "{{BASE_URL}}/reset-password?token=" + urlEncode(token);
    if (!tenantSlug.empty())
        link += "&tenant=" + urlEncode(tenantSlug);
    return link;
}

} // namespace pyracms
