#include "services/EmailService.h"
#include "services/email/EmailServiceInternal.h"

#include <cstring>
#include <curl/curl.h>
#include <sstream>

namespace pyracms {

std::string EmailService::verificationEmailTemplate(const std::string &token) {
    return R"html(
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px;)html"
           R"html( margin: 0 auto; padding: 20px;">
    <h2 style="color: #333;">Verify Your Email Address</h2>
    <p>Thank you for registering with PyraCMS. Please click the)html"
           R"html( button below to verify your email address.</p>
    <p style="text-align: center; margin: 30px 0;">
        <a href=")html" +
           std::string("{{BASE_URL}}/verify-email?token=") + token +
           R"html("
           style="background-color: #4CAF50; color: white; padding: 12px 24px;
                  text-decoration: none; border-radius: 4px;)html"
           R"html( display: inline-block;">
            Verify Email
        </a>
    </p>
    <p style="color: #666; font-size: 12px;">
        If you did not create an account, please ignore this email.
        This link will expire in 24 hours.
    </p>
    <p style="color: #666; font-size: 12px;">
        Or copy this link: {{BASE_URL}}/verify-email?token=)html" +
           token + R"html(
    </p>
</body>
</html>
)html";
}

} // namespace pyracms
