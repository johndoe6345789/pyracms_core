#include "services/upload/UploadHash.h"

#include <cstring>
#include <openssl/md5.h>
#include <openssl/sha.h>

// SHA256_CTX is a plain struct of integers: its bytes are the state.
#pragma GCC diagnostic ignored "-Wdeprecated-declarations"

namespace pyracms {

static const char *kHex = "0123456789abcdef";

static std::string toHex(const unsigned char *p, size_t n) {
    std::string out;
    for (size_t i = 0; i < n; ++i) {
        out += kHex[p[i] >> 4];
        out += kHex[p[i] & 15];
    }
    return out;
}

static int nib(char c) {
    if (c >= '0' && c <= '9')
        return c - '0';
    return c >= 'a' && c <= 'f' ? c - 'a' + 10 : -1;
}

static bool load(const std::string &hex, SHA256_CTX &c) {
    if (hex.size() != sizeof(c) * 2)
        return false;
    auto *out = reinterpret_cast<unsigned char *>(&c);
    for (size_t i = 0; i < sizeof(c); ++i) {
        int hi = nib(hex[2 * i]), lo = nib(hex[2 * i + 1]);
        if (hi < 0 || lo < 0)
            return false;
        out[i] = static_cast<unsigned char>(hi << 4 | lo);
    }
    return true;
}

static std::string dump(const SHA256_CTX &c) {
    return toHex(reinterpret_cast<const unsigned char *>(&c), sizeof(c));
}

std::string shaStateInit() {
    SHA256_CTX c;
    SHA256_Init(&c);
    return dump(c);
}

std::string shaStateUpdate(const std::string &hex, std::string_view data) {
    SHA256_CTX c;
    if (!load(hex, c))
        return "";
    SHA256_Update(&c, data.data(), data.size());
    return dump(c);
}

std::string shaStateFinal(const std::string &hex) {
    SHA256_CTX c;
    if (!load(hex, c))
        return "";
    unsigned char d[SHA256_DIGEST_LENGTH];
    SHA256_Final(d, &c);
    return toHex(d, sizeof(d));
}

std::string md5Hex(std::string_view data) {
    unsigned char d[MD5_DIGEST_LENGTH];
    MD5(reinterpret_cast<const unsigned char *>(data.data()), data.size(),
        d);
    return toHex(d, sizeof(d));
}

} // namespace pyracms
