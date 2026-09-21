#pragma once

#include "http_harness.h"

#include <openssl/sha.h>

namespace harness {

// PUT with a raw octet-stream body (chunked-upload parts).
inline Reply putRaw(const std::string &path, const std::string &body,
                    const std::string &token) {
    auto req = drogon::HttpRequest::newHttpRequest();
    req->setMethod(drogon::Put);
    req->setPath(path);
    req->setContentTypeCode(drogon::CT_APPLICATION_OCTET_STREAM);
    req->setBody(body);
    if (!token.empty())
        req->addHeader("Authorization", "Bearer " + token);
    auto res = server().client->sendRequest(req, 15);
    Reply r;
    if (res.first != drogon::ReqResult::Ok)
        return r;
    r.status = res.second->statusCode();
    Json::Reader().parse(std::string(res.second->body()), r.json);
    return r;
}

inline std::string sha256Of(const std::string &d) {
    unsigned char h[SHA256_DIGEST_LENGTH];
    SHA256(reinterpret_cast<const unsigned char *>(d.data()), d.size(), h);
    std::string out;
    for (unsigned char b : h) {
        out += "0123456789abcdef"[b >> 4];
        out += "0123456789abcdef"[b & 15];
    }
    return out;
}

} // namespace harness
