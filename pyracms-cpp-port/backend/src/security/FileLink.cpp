#include "security/FileLink.h"

#include "security/SecurityConfig.h"

#include <cstdlib>
#include <openssl/crypto.h>
#include <openssl/hmac.h>

namespace pyracms {

std::string fileLinkSig(const std::string &uuid, long long exp) {
    auto key = "file-link|" + resolveJwtSecret();
    auto payload = uuid + "." + std::to_string(exp);
    unsigned char mac[EVP_MAX_MD_SIZE];
    unsigned int len = 0;
    HMAC(EVP_sha256(), key.data(), static_cast<int>(key.size()),
         reinterpret_cast<const unsigned char *>(payload.data()),
         payload.size(), mac, &len);
    static const char *h = "0123456789abcdef";
    std::string out;
    for (unsigned int i = 0; i < len; ++i) {
        out += h[mac[i] >> 4];
        out += h[mac[i] & 15];
    }
    return out;
}

bool fileLinkValid(const std::string &uuid, const std::string &exp,
                   const std::string &sig, long long now) {
    if (exp.empty() || exp.size() > 12 ||
        exp.find_first_not_of("0123456789") != std::string::npos)
        return false;
    auto when = std::atoll(exp.c_str());
    if (when <= now)
        return false;
    auto want = fileLinkSig(uuid, when);
    return sig.size() == want.size() &&
           CRYPTO_memcmp(sig.data(), want.data(), want.size()) == 0;
}

} // namespace pyracms
