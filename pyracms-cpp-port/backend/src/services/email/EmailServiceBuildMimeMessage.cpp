#include "services/EmailService.h"
#include "services/email/EmailServiceInternal.h"

#include <cstring>
#include <curl/curl.h>
#include <sstream>

namespace pyracms {

std::string EmailService::buildMimeMessage(const std::string &to,
                                           const std::string &subject,
                                           const std::string &htmlBody) {
    std::ostringstream msg;
    msg << "From: " << headerSafe(smtpFrom_) << "\r\n";
    msg << "To: " << headerSafe(to) << "\r\n";
    msg << "Subject: " << headerSafe(subject) << "\r\n";
    msg << "MIME-Version: 1.0\r\n";
    msg << "Content-Type: text/html; charset=UTF-8\r\n";
    msg << "\r\n";
    msg << htmlBody << "\r\n";
    return msg.str();
}

} // namespace pyracms
