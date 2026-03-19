#include "services/EmailService.h"
#include <curl/curl.h>
#include <sstream>
#include <cstring>

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

struct UploadContext {
    std::string data;
    size_t offset;
};

static size_t payloadSource(void *ptr, size_t size, size_t nmemb, void *userp) {
    auto *ctx = static_cast<UploadContext *>(userp);
    size_t room = size * nmemb;
    size_t remaining = ctx->data.size() - ctx->offset;

    if (remaining == 0) return 0;

    size_t toSend = std::min(room, remaining);
    std::memcpy(ptr, ctx->data.data() + ctx->offset, toSend);
    ctx->offset += toSend;
    return toSend;
}

std::string EmailService::buildMimeMessage(const std::string &to,
                                            const std::string &subject,
                                            const std::string &htmlBody) {
    std::ostringstream msg;
    msg << "From: " << smtpFrom_ << "\r\n";
    msg << "To: " << to << "\r\n";
    msg << "Subject: " << subject << "\r\n";
    msg << "MIME-Version: 1.0\r\n";
    msg << "Content-Type: text/html; charset=UTF-8\r\n";
    msg << "\r\n";
    msg << htmlBody << "\r\n";
    return msg.str();
}

void EmailService::sendEmail(const std::string &to,
                              const std::string &subject,
                              const std::string &htmlBody,
                              BoolCallback cb) {
    // Run SMTP send in Drogon's thread pool to avoid blocking event loop
    auto smtpUrl = "smtp://" + smtpHost_ + ":" + std::to_string(smtpPort_);
    auto mimeMsg = buildMimeMessage(to, subject, htmlBody);
    auto fromAddr = smtpFrom_;
    auto user = smtpUser_;
    auto pass = smtpPass_;

    drogon::app().getLoop()->runInLoop(
        [smtpUrl, mimeMsg, fromAddr, to, user, pass, cb]() {
            // Use a separate thread for blocking curl operations
            std::thread([smtpUrl, mimeMsg, fromAddr, to, user, pass, cb]() {
                CURL *curl = curl_easy_init();
                if (!curl) {
                    cb(false, "Failed to initialize CURL");
                    return;
                }

                auto uploadCtx = std::make_unique<UploadContext>();
                uploadCtx->data = mimeMsg;
                uploadCtx->offset = 0;

                curl_easy_setopt(curl, CURLOPT_URL, smtpUrl.c_str());
                curl_easy_setopt(curl, CURLOPT_USE_SSL, CURLUSESSL_ALL);
                curl_easy_setopt(curl, CURLOPT_MAIL_FROM, fromAddr.c_str());

                struct curl_slist *recipients = nullptr;
                recipients = curl_slist_append(recipients, to.c_str());
                curl_easy_setopt(curl, CURLOPT_MAIL_RCPT, recipients);

                if (!user.empty()) {
                    curl_easy_setopt(curl, CURLOPT_USERNAME, user.c_str());
                    curl_easy_setopt(curl, CURLOPT_PASSWORD, pass.c_str());
                }

                curl_easy_setopt(curl, CURLOPT_READFUNCTION, payloadSource);
                curl_easy_setopt(curl, CURLOPT_READDATA, uploadCtx.get());
                curl_easy_setopt(curl, CURLOPT_UPLOAD, 1L);

                // Timeout settings
                curl_easy_setopt(curl, CURLOPT_CONNECTTIMEOUT, 10L);
                curl_easy_setopt(curl, CURLOPT_TIMEOUT, 30L);

                CURLcode res = curl_easy_perform(curl);

                curl_slist_free_all(recipients);
                curl_easy_cleanup(curl);

                if (res != CURLE_OK) {
                    cb(false, std::string("SMTP error: ") + curl_easy_strerror(res));
                } else {
                    cb(true, "");
                }
            }).detach();
        });
}

std::string EmailService::verificationEmailTemplate(const std::string &token) {
    return R"html(
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #333;">Verify Your Email Address</h2>
    <p>Thank you for registering with PyraCMS. Please click the button below to verify your email address.</p>
    <p style="text-align: center; margin: 30px 0;">
        <a href=")html" + std::string("{{BASE_URL}}/verify-email?token=") + token + R"html("
           style="background-color: #4CAF50; color: white; padding: 12px 24px;
                  text-decoration: none; border-radius: 4px; display: inline-block;">
            Verify Email
        </a>
    </p>
    <p style="color: #666; font-size: 12px;">
        If you did not create an account, please ignore this email.
        This link will expire in 24 hours.
    </p>
    <p style="color: #666; font-size: 12px;">
        Or copy this link: {{BASE_URL}}/verify-email?token=)html" + token + R"html(
    </p>
</body>
</html>
)html";
}

std::string EmailService::passwordResetEmailTemplate(const std::string &token) {
    return R"html(
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #333;">Password Reset Request</h2>
    <p>We received a request to reset your password. Click the button below to set a new password.</p>
    <p style="text-align: center; margin: 30px 0;">
        <a href=")html" + std::string("{{BASE_URL}}/reset-password?token=") + token + R"html("
           style="background-color: #2196F3; color: white; padding: 12px 24px;
                  text-decoration: none; border-radius: 4px; display: inline-block;">
            Reset Password
        </a>
    </p>
    <p style="color: #666; font-size: 12px;">
        If you did not request a password reset, please ignore this email.
        This link will expire in 1 hour.
    </p>
    <p style="color: #666; font-size: 12px;">
        Or copy this link: {{BASE_URL}}/reset-password?token=)html" + token + R"html(
    </p>
</body>
</html>
)html";
}

std::string EmailService::notificationEmailTemplate(const std::string &subject,
                                                     const std::string &message) {
    return R"html(
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #333;">)html" + subject + R"html(</h2>
    <div style="background-color: #f5f5f5; padding: 16px; border-radius: 4px; margin: 20px 0;">
        <p style="margin: 0;">)html" + message + R"html(</p>
    </div>
    <p style="color: #666; font-size: 12px;">
        You received this notification from PyraCMS.
        You can manage your notification preferences in your account settings.
    </p>
</body>
</html>
)html";
}

void EmailService::sendVerificationEmail(const std::string &to,
                                          const std::string &token,
                                          BoolCallback cb) {
    sendEmail(to, "Verify Your Email - PyraCMS",
              verificationEmailTemplate(token), std::move(cb));
}

void EmailService::sendPasswordResetEmail(const std::string &to,
                                           const std::string &token,
                                           BoolCallback cb) {
    sendEmail(to, "Password Reset - PyraCMS",
              passwordResetEmailTemplate(token), std::move(cb));
}

void EmailService::sendNotificationEmail(const std::string &to,
                                          const std::string &subject,
                                          const std::string &message,
                                          BoolCallback cb) {
    sendEmail(to, subject,
              notificationEmailTemplate(subject, message), std::move(cb));
}

} // namespace pyracms
