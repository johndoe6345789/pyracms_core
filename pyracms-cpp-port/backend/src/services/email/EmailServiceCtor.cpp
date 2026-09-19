#include "services/EmailService.h"
#include "services/email/EmailServiceInternal.h"

#include <cstring>
#include <curl/curl.h>
#include <sstream>

namespace pyracms {

EmailService::EmailService() {
    const char *host = std::getenv("SMTP_HOST");
    const char *port = std::getenv("SMTP_PORT");
    const char *user = std::getenv("SMTP_USER");
    const char *pass = std::getenv("SMTP_PASS");
    const char *from = std::getenv("SMTP_FROM");

    smtpHost_ = host ? host : "smtp.gmail.com";
    smtpPort_ = port ? std::stoi(port) : 587;
    smtpUser_ = user ? user : "";
    smtpPass_ = pass ? pass : "";
    smtpFrom_ = from ? from : "noreply@pyracms.com";
}

} // namespace pyracms
