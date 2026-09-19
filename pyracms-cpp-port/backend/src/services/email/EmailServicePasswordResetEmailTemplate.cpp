#include "services/EmailService.h"
#include "services/email/EmailServiceInternal.h"

#include <cstring>
#include <curl/curl.h>
#include <sstream>

namespace pyracms {

std::string EmailService::passwordResetEmailTemplate(const std::string &token) {
    return R"html(
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px;)html"
           R"html( margin: 0 auto; padding: 20px;">
    <h2 style="color: #333;">Password Reset Request</h2>
    <p>We received a request to reset your password. Click the)html"
           R"html( button below to set a new password.</p>
    <p style="text-align: center; margin: 30px 0;">
        <a href=")html" +
           std::string("{{BASE_URL}}/reset-password?token=") + token +
           R"html("
           style="background-color: #2196F3; color: white; padding: 12px 24px;
                  text-decoration: none; border-radius: 4px;)html"
           R"html( display: inline-block;">
            Reset Password
        </a>
    </p>
    <p style="color: #666; font-size: 12px;">
        If you did not request a password reset, please ignore this email.
        This link will expire in 1 hour.
    </p>
    <p style="color: #666; font-size: 12px;">
        Or copy this link: {{BASE_URL}}/reset-password?token=)html" +
           token + R"html(
    </p>
</body>
</html>
)html";
}

} // namespace pyracms
