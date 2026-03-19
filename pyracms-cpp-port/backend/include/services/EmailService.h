#pragma once

#include <drogon/drogon.h>
#include <string>
#include <functional>

namespace pyracms {

class EmailService {
public:
    using BoolCallback = std::function<void(bool success, const std::string &error)>;

    EmailService();

    void sendEmail(const std::string &to,
                   const std::string &subject,
                   const std::string &htmlBody,
                   BoolCallback cb);

    void sendVerificationEmail(const std::string &to,
                               const std::string &token,
                               BoolCallback cb);

    void sendPasswordResetEmail(const std::string &to,
                                const std::string &token,
                                BoolCallback cb);

    void sendNotificationEmail(const std::string &to,
                               const std::string &subject,
                               const std::string &message,
                               BoolCallback cb);

private:
    std::string smtpHost_;
    int smtpPort_;
    std::string smtpUser_;
    std::string smtpPass_;
    std::string smtpFrom_;

    std::string buildMimeMessage(const std::string &to,
                                 const std::string &subject,
                                 const std::string &htmlBody);

    static std::string verificationEmailTemplate(const std::string &token);
    static std::string passwordResetEmailTemplate(const std::string &token);
    static std::string notificationEmailTemplate(const std::string &subject,
                                                 const std::string &message);
};

} // namespace pyracms
