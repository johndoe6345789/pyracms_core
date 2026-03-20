#pragma once

#include <drogon/drogon.h>
#include <string>
#include <optional>

namespace pyracms {

struct TokenPayload {
    int userId;
    std::string username;
    std::string role;
};

class AuthService {
public:
    AuthService();

    // Password hashing
    std::string hashPassword(const std::string &password);
    bool verifyPassword(const std::string &password, const std::string &hash);

    // JWT
    std::string generateToken(int userId, const std::string &username);
    std::optional<TokenPayload> verifyToken(const std::string &token);

    // Token management
    std::string generateRandomToken();

private:
    std::string jwtSecret_;
    int tokenExpirySeconds_;
};

} // namespace pyracms
