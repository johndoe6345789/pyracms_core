#include "storage/S3Sign.h"

namespace pyracms {

std::string s3PresignedGetUrl(const StorageConfig &cfg,
                              const S3Endpoint &ep, const std::string &path,
                              int expiresS, const std::string &amzDate) {
    auto scope = amzDate.substr(0, 8) + "/" + cfg.region +
                 "/s3/aws4_request";
    auto query = "X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=" +
                 sigv4UriEncode(cfg.accessKey + "/" + scope, false) +
                 "&X-Amz-Date=" + amzDate +
                 "&X-Amz-Expires=" + std::to_string(expiresS) +
                 "&X-Amz-SignedHeaders=host";
    SigV4Request r;
    r.method = "GET";
    r.path = ep.prefix + path;
    r.query = query;
    r.amzDate = amzDate;
    r.payloadSha = "UNSIGNED-PAYLOAD";
    r.presigned = true;
    r.headers["host"] = s3HostHeader(ep);
    auto sig = sigv4Sign({cfg.accessKey, cfg.secretKey, cfg.region}, r);
    return ep.origin + sigv4UriEncode(sigv4DecodePath(r.path), true) + "?" +
           query + "&X-Amz-Signature=" + sig;
}

} // namespace pyracms
