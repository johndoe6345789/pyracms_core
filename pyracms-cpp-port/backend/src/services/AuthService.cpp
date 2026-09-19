#include "services/AuthService.h"
#include "security/SecurityConfig.h"
#include <jwt-cpp/traits/nlohmann-json/defaults.h>
#include <openssl/evp.h>
#include <openssl/rand.h>
#include <random>
#include <sstream>
#include <iomanip>
#include <chrono>
#include <cctype>
#include <cstring>

namespace pyracms {

AuthService::AuthService()
    : tokenExpirySeconds_(86400) // 24 hours
{
    // Never a hard-coded default: see resolveJwtSecret().
    jwtSecret_ = resolveJwtSecret();
    if (const char *ttl = std::getenv("JWT_EXPIRY_SECONDS")) {
        int v = std::atoi(ttl);
        if (v >= 60 && v <= 30 * 86400)
            tokenExpirySeconds_ = v;
    }
}

// PBKDF2 with OpenSSL — proper password hashing
// Format: "salt_hex:hash_hex" (salt is 16 bytes, hash is 32 bytes)
static constexpr int SALT_LEN = 16;
static constexpr int HASH_LEN = 32;
static constexpr int ITERATIONS = 100000;

static std::string bytesToHex(const unsigned char *data, int len) {
    std::stringstream ss;
    for (int i = 0; i < len; ++i) {
        ss << std::hex << std::setfill('0') << std::setw(2)
           << static_cast<int>(data[i]);
    }
    return ss.str();
}

// Malformed hex (corrupt stored hash) yields an empty vector, never
// an exception.
static std::vector<unsigned char> hexToBytes(const std::string &hex) {
    std::vector<unsigned char> bytes;
    if (hex.length() % 2 != 0)
        return bytes;
    bytes.reserve(hex.length() / 2);
    for (size_t i = 0; i < hex.length(); i += 2) {
        auto hi = std::isxdigit(static_cast<unsigned char>(hex[i]));
        auto lo = std::isxdigit(static_cast<unsigned char>(hex[i + 1]));
        if (!hi || !lo)
            return {};
        bytes.push_back(static_cast<unsigned char>(
            std::stoi(hex.substr(i, 2), nullptr, 16)));
    }
    return bytes;
}

std::string AuthService::hashPassword(const std::string &password) {
    unsigned char salt[SALT_LEN];
    RAND_bytes(salt, SALT_LEN);

    unsigned char hash[HASH_LEN];
    PKCS5_PBKDF2_HMAC(password.c_str(),
                       static_cast<int>(password.length()),
                       salt, SALT_LEN,
                       ITERATIONS,
                       EVP_sha256(),
                       HASH_LEN, hash);

    return bytesToHex(salt, SALT_LEN) + ":" + bytesToHex(hash, HASH_LEN);
}

bool AuthService::verifyPassword(const std::string &password,
                                  const std::string &storedHash) {
    // Parse "salt_hex:hash_hex"
    auto colonPos = storedHash.find(':');
    if (colonPos == std::string::npos) {
        return false;
    }

    auto saltHex = storedHash.substr(0, colonPos);
    auto expectedHashHex = storedHash.substr(colonPos + 1);

    auto salt = hexToBytes(saltHex);
    if (salt.size() != SALT_LEN) {
        return false;
    }

    unsigned char computedHash[HASH_LEN];
    PKCS5_PBKDF2_HMAC(password.c_str(),
                       static_cast<int>(password.length()),
                       salt.data(), SALT_LEN,
                       ITERATIONS,
                       EVP_sha256(),
                       HASH_LEN, computedHash);

    auto computedHex = bytesToHex(computedHash, HASH_LEN);
    if (expectedHashHex.length() != computedHex.length())
        return false;
    // Constant-time comparison to prevent timing attacks
    return CRYPTO_memcmp(computedHex.c_str(), expectedHashHex.c_str(),
                         computedHex.length()) == 0;
}

std::string AuthService::generateToken(int userId,
                                        const std::string &username,
                                        int tenantId) {
    auto now = std::chrono::system_clock::now();
    auto token = jwt::create()
        .set_issuer("pyracms")
        .set_subject(std::to_string(userId))
        .set_payload_claim("username", jwt::claim(username))
        .set_payload_claim("tenantId",
                           jwt::claim(std::to_string(tenantId)))
        .set_issued_at(now)
        .set_expires_at(now + std::chrono::seconds(tokenExpirySeconds_))
        .sign(jwt::algorithm::hs256{jwtSecret_});
    return token;
}

std::optional<TokenPayload> AuthService::verifyToken(const std::string &token) {
    try {
        auto verifier = jwt::verify()
            .allow_algorithm(jwt::algorithm::hs256{jwtSecret_})
            .with_issuer("pyracms");

        auto decoded = jwt::decode(token);
        verifier.verify(decoded);
        // A token that never expires is never accepted.
        if (!decoded.has_expires_at() || !decoded.has_issued_at())
            return std::nullopt;

        TokenPayload payload;
        payload.userId = std::stoi(decoded.get_subject());
        payload.issuedAt = std::chrono::duration_cast<std::chrono::seconds>(
                               decoded.get_issued_at().time_since_epoch())
                               .count();
        payload.username = decoded.get_payload_claim("username").as_string();
        payload.tenantId = decoded.has_payload_claim("tenantId")
            ? std::stoi(decoded.get_payload_claim("tenantId").as_string())
            : 0;
        return payload;
    } catch (const std::exception &) {
        return std::nullopt;
    }
}

// Same work as a real check, so "no such account" costs the same time
// as "wrong password".
void AuthService::burnPasswordCheck(const std::string &password) {
    static const std::string decoy = hashPassword("decoy-password");
    verifyPassword(password, decoy);
}

std::string AuthService::generateRandomToken() {
    unsigned char bytes[32];
    RAND_bytes(bytes, 32);
    return bytesToHex(bytes, 32);
}

} // namespace pyracms
