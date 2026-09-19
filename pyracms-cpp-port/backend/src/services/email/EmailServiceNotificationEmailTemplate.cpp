#include "services/EmailService.h"
#include "services/email/EmailServiceInternal.h"

#include <cstring>
#include <curl/curl.h>
#include <sstream>

namespace pyracms {

std::string
EmailService::notificationEmailTemplate(const std::string &subject,
                                        const std::string &message) {
    return R"html(
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px;)html"
           R"html( margin: 0 auto; padding: 20px;">
    <h2 style="color: #333;">)html" +
           htmlEscape(subject) +
           R"html(</h2>
    <div style="background-color: #f5f5f5; padding: 16px;)html"
           R"html( border-radius: 4px; margin: 20px 0;">
        <p style="margin: 0;">)html" +
           htmlEscape(message) + R"html(</p>
    </div>
    <p style="color: #666; font-size: 12px;">
        You received this notification from PyraCMS.
        You can manage your notification preferences in your account settings.
    </p>
</body>
</html>
)html";
}

} // namespace pyracms
