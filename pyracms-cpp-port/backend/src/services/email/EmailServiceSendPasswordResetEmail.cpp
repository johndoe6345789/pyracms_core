#include "services/EmailService.h"
#include "services/email/EmailServiceInternal.h"

#include <cstring>
#include <curl/curl.h>
#include <sstream>

namespace pyracms {

void EmailService::sendPasswordResetEmail(const std::string &to,
                                          const std::string &token,
                                          BoolCallback cb) {
    sendEmail(to, "Password Reset - PyraCMS",
              fillBaseUrl(passwordResetEmailTemplate(token)), std::move(cb));
}

} // namespace pyracms
