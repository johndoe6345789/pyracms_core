#pragma once

#include <drogon/drogon.h>
#include <string>
#include <optional>

namespace pyracms {

struct TokenPayload {
    int userId;
    std::string username;
    std::string role;
    int tenantId{0}; // 0 = platform account
    long long issuedAt{0}; // epoch seconds
};

class AuthService {
public:
    AuthService();

    // Password hashing
    std::string hashPassword(const std::string &password);
    bool verifyPassword(const std::string &password, const std::string &hash);

    // JWT
    std::string generateToken(int userId, const std::string &username,
                              int tenantId = 0);
    std::optional<TokenPayload> verifyToken(const std::string &token);

    // Token management
    std::string generateRandomToken();

    // Password limit: PBKDF2 cost grows with input length.
    static constexpr size_t kMaxPasswordLen = 256;

    // Spend one hash-verify of time (login for an unknown account).
    void burnPasswordCheck(const std::string &password);

private:
    std::string jwtSecret_;
    int tokenExpirySeconds_;
};

} // namespace pyracms
