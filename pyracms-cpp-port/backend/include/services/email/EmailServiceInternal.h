#pragma once

#include "services/EmailService.h"

#include <cstring>
#include <curl/curl.h>
#include <sstream>

namespace pyracms {

// A header value must never carry a line break (header injection).
inline std::string headerSafe(const std::string &v) {
    std::string out;
    for (unsigned char c : v) {
        if (c >= 0x20 && c != 0x7f)
            out += static_cast<char>(c);
    }
    return out;
}

inline std::string htmlEscape(const std::string &v) {
    std::string out;
    for (char c : v) {
        switch (c) {
        case '&':
            out += "&amp;";
            break;
        case '<':
            out += "&lt;";
            break;
        case '>':
            out += "&gt;";
            break;
        case '"':
            out += "&quot;";
            break;
        case '\'':
            out += "&#39;";
            break;
        default:
            out += c;
        }
    }
    return out;
}

// Links in mail point at the configured site, never at a request header.
inline std::string fillBaseUrl(std::string body) {
    const char *env = std::getenv("PUBLIC_BASE_URL");
    std::string base = env && *env ? env : "http://localhost:3000";
    const std::string key = "{{BASE_URL}}";
    for (auto pos = body.find(key); pos != std::string::npos;
         pos = body.find(key, pos + base.size()))
        body.replace(pos, key.size(), base);
    return body;
}

struct UploadContext {
    std::string data;
    size_t offset;
};

inline size_t payloadSource(void *ptr, size_t size, size_t nmemb, void *userp) {
    auto *ctx = static_cast<UploadContext *>(userp);
    size_t room = size * nmemb;
    size_t remaining = ctx->data.size() - ctx->offset;

    if (remaining == 0)
        return 0;

    size_t toSend = std::min(room, remaining);
    std::memcpy(ptr, ctx->data.data() + ctx->offset, toSend);
    ctx->offset += toSend;
    return toSend;
}

} // namespace pyracms
