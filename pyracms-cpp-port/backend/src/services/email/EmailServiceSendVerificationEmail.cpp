#include "services/EmailService.h"
#include "services/email/EmailServiceInternal.h"

#include <cstring>
#include <curl/curl.h>
#include <sstream>

namespace pyracms {

void EmailService::sendVerificationEmail(const std::string &to,
                                         const std::string &token,
                                         BoolCallback cb) {
    sendEmail(to, "Verify Your Email - PyraCMS",
              fillBaseUrl(verificationEmailTemplate(token)), std::move(cb));
}

} // namespace pyracms
