#include "services/EmailService.h"
#include "services/email/EmailServiceInternal.h"

#include <cstring>
#include <curl/curl.h>
#include <sstream>

namespace pyracms {

void EmailService::sendEmail(const std::string &to, const std::string &subject,
                             const std::string &htmlBody, BoolCallback cb) {
    // Run SMTP send in Drogon's thread pool to avoid blocking event loop
    auto smtpUrl = "smtp://" + smtpHost_ + ":" + std::to_string(smtpPort_);
    auto mimeMsg = buildMimeMessage(to, subject, htmlBody);
    auto fromAddr = smtpFrom_;
    auto user = smtpUser_;
    auto pass = smtpPass_;

    if (to.find_first_of("\r\n<>\"") != std::string::npos) {
        cb(false, "Invalid recipient");
        return;
    }
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
                    cb(false,
                       std::string("SMTP error: ") + curl_easy_strerror(res));
                } else {
                    cb(true, "");
                }
            }).detach();
        });
}

} // namespace pyracms
