#ifndef PYRACMS_AUTH_HANDLER_H
#define PYRACMS_AUTH_HANDLER_H

#include <string>
#include <optional>

namespace pyracms {

class AuthHandler {
public:
    AuthHandler();
    ~AuthHandler();

    // Authentication
    std::string hashPassword(const std::string& password);
    bool verifyPassword(const std::string& password, const std::string& hash);
    
    // Token management
    std::string generateToken(const std::string& username, int user_id);
    std::optional<int> verifyToken(const std::string& token);
    
    // Session management
    bool createSession(int user_id, const std::string& token);
    bool validateSession(const std::string& token);
    void invalidateSession(const std::string& token);

private:
    std::string secret_key_;
};

} // namespace pyracms

#endif // PYRACMS_AUTH_HANDLER_H
