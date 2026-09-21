#include "storage/SigV4.h"

#include <openssl/evp.h>
#include <openssl/hmac.h>

#include <ctime>

namespace pyracms {

std::string toHex(const std::string &raw) {
    static const char *d = "0123456789abcdef";
    std::string out;
    for (unsigned char c : raw) {
        out += d[c >> 4];
        out += d[c & 15];
    }
    return out;
}

std::string hmacSha256(const std::string &key, const std::string &msg) {
    unsigned char md[EVP_MAX_MD_SIZE];
    unsigned int len = 0;
    HMAC(EVP_sha256(), key.data(), static_cast<int>(key.size()),
         reinterpret_cast<const unsigned char *>(msg.data()), msg.size(),
         md, &len);
    return std::string(reinterpret_cast<char *>(md), len);
}

std::string sigv4UtcNow() {
    std::time_t t = std::time(nullptr);
    std::tm tm{};
    gmtime_r(&t, &tm);
    char buf[32];
    std::strftime(buf, sizeof buf, "%Y%m%dT%H%M%SZ", &tm);
    return buf;
}

} // namespace pyracms
