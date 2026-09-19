#include "services/EmailService.h"
#include "services/email/EmailServiceInternal.h"

#include <cstring>
#include <curl/curl.h>
#include <sstream>

namespace pyracms {

void EmailService::sendNotificationEmail(const std::string &to,
                                         const std::string &subject,
                                         const std::string &message,
                                         BoolCallback cb) {
    sendEmail(to, subject, notificationEmailTemplate(subject, message),
              std::move(cb));
}

} // namespace pyracms
