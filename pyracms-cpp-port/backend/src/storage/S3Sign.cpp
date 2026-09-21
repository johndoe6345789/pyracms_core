#include "storage/S3Sign.h"

namespace pyracms {

std::string s3HostHeader(const S3Endpoint &ep) {
    auto host = ep.origin.substr(ep.origin.find("://") + 3);
    bool https = ep.origin.rfind("https", 0) == 0;
    for (auto def : {std::string(":80"), std::string(":443")}) {
        bool match = (def == ":80" && !https) || (def == ":443" && https);
        if (match && host.size() > def.size() &&
            host.compare(host.size() - def.size(), def.size(), def) == 0)
            host.erase(host.size() - def.size());
    }
    return host;
}

HeaderList s3SignedHeaders(const StorageConfig &cfg, const S3Endpoint &ep,
                           const std::string &method,
                           const std::string &target,
                           const std::string &body) {
    auto q = target.find('?');
    SigV4Request r;
    r.method = method;
    r.path = target.substr(0, q);
    r.query = q == std::string::npos ? "" : target.substr(q + 1);
    r.amzDate = sigv4UtcNow();
    r.payloadSha = sha256Hex(body);
    auto host = s3HostHeader(ep);
    r.headers["host"] = host;
    std::string auth;
    sigv4Sign({cfg.accessKey, cfg.secretKey, cfg.region}, r, &auth);
    return {{"Host", host},
            {"x-amz-date", r.amzDate},
            {"x-amz-content-sha256", r.payloadSha},
            {"Authorization", auth}};
}

} // namespace pyracms
