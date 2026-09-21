#pragma once

#include <map>
#include <string>

namespace pyracms {

// AWS Signature Version 4 for S3 (header auth). Standalone: no I/O.
struct SigV4Key {
    std::string access;
    std::string secret;
    std::string region{"us-east-1"};
};

struct SigV4Request {
    std::string method;  // GET, PUT, ...
    std::string path;    // as sent on the wire, e.g. "/b/k" (no query)
    std::string query;   // raw query without "?", may be empty
    std::string amzDate; // 20130524T000000Z
    std::string payloadSha; // hex sha256 of the body
    bool presigned{false};  // query auth: add no x-amz-* headers
    // Lower-case name -> value; must hold "host". x-amz-date and
    // x-amz-content-sha256 are added by the signer.
    std::map<std::string, std::string> headers;
};

std::string sha256Hex(const std::string &data);
std::string hmacSha256(const std::string &key, const std::string &msg);
std::string toHex(const std::string &raw);
std::string sigv4UriEncode(const std::string &s, bool keepSlash);
std::string sigv4DecodePath(const std::string &s); // %XX -> byte
std::string sigv4CanonicalQuery(const std::string &rawQuery);
std::string sigv4UtcNow(); // yyyymmddThhmmssZ

// The lower-case hex signature, and (via *authorization) the whole
// "AWS4-HMAC-SHA256 Credential=..., SignedHeaders=..., Signature=..."
// header value.
std::string sigv4Sign(const SigV4Key &key, const SigV4Request &req,
                      std::string *authorization = nullptr);

} // namespace pyracms
