#include "security/Hash.h"

#include <openssl/sha.h>

namespace pyracms {

std::string sha256Hex(const std::string &data) {
    unsigned char d[SHA256_DIGEST_LENGTH];
    SHA256(reinterpret_cast<const unsigned char *>(data.data()), data.size(),
           d);
    static const char *hex = "0123456789abcdef";
    std::string out;
    for (unsigned char b : d) {
        out += hex[b >> 4];
        out += hex[b & 15];
    }
    return out;
}

} // namespace pyracms
