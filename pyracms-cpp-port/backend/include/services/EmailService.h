#pragma once

#include <drogon/drogon.h>
#include <functional>
#include <string>

namespace pyracms {

class EmailService {
  public:
    using BoolCallback =
        std::function<void(bool success, const std::string &error)>;

    EmailService();

    void sendEmail(const std::string &to, const std::string &subject,
                   const std::string &htmlBody, BoolCallback cb);

    // tenantSlug "" = platform account. The link carries `&tenant=<slug>`
    // so the reset page signs the person back in to the right site.
    void sendPasswordResetEmail(const std::string &to, const std::string &token,
                                const std::string &tenantSlug, BoolCallback cb);

    // "{{BASE_URL}}/reset-password?token=..[&tenant=..]" (URL-encoded).
    static std::string resetLink(const std::string &token,
                                 const std::string &tenantSlug);

  private:
    std::string smtpHost_;
    int smtpPort_;
    std::string smtpUser_;
    std::string smtpPass_;
    std::string smtpFrom_;

    std::string buildMimeMessage(const std::string &to,
                                 const std::string &subject,
                                 const std::string &htmlBody);

    static std::string passwordResetEmailTemplate(const std::string &link);
};

} // namespace pyracms
