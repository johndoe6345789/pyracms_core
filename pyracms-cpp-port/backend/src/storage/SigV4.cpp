#include "storage/SigV4.h"

namespace pyracms {

static std::string trim(const std::string &v) {
    auto b = v.find_first_not_of(" \t");
    auto e = v.find_last_not_of(" \t");
    return b == std::string::npos ? "" : v.substr(b, e - b + 1);
}

std::string sigv4Sign(const SigV4Key &key, const SigV4Request &req,
                      std::string *authorization) {
    auto hdrs = req.headers;
    if (!req.presigned) {
        hdrs["x-amz-date"] = req.amzDate;
        hdrs["x-amz-content-sha256"] = req.payloadSha;
    }
    std::string canonHeaders, signed_;
    for (auto &h : hdrs) { // std::map: already sorted by name
        canonHeaders += h.first + ":" + trim(h.second) + "\n";
        signed_ += (signed_.empty() ? "" : ";") + h.first;
    }
    // S3: the path is encoded exactly once (no double encoding).
    auto canon = req.method + "\n" +
                 sigv4UriEncode(sigv4DecodePath(req.path), true) + "\n" +
                 sigv4CanonicalQuery(req.query) + "\n" + canonHeaders +
                 "\n" + signed_ + "\n" + req.payloadSha;
    auto day = req.amzDate.substr(0, 8);
    auto scope = day + "/" + key.region + "/s3/aws4_request";
    auto toSign = "AWS4-HMAC-SHA256\n" + req.amzDate + "\n" + scope +
                  "\n" + sha256Hex(canon);
    auto k = hmacSha256("AWS4" + key.secret, day);
    k = hmacSha256(k, key.region);
    k = hmacSha256(k, "s3");
    k = hmacSha256(k, "aws4_request");
    auto sig = toHex(hmacSha256(k, toSign));
    if (authorization)
        *authorization = "AWS4-HMAC-SHA256 Credential=" + key.access + "/" +
                         scope + ", SignedHeaders=" + signed_ +
                         ", Signature=" + sig;
    return sig;
}

} // namespace pyracms
