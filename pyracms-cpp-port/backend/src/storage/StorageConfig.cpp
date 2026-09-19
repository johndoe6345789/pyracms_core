#include "storage/StorageConfig.h"
#include "security/SecurityConfig.h"

#include <cctype>
#include <cstdlib>

namespace pyracms {

static std::string env(const char *name, const std::string &def = "") {
    const char *v = std::getenv(name);
    return v && *v ? v : def;
}

StorageConfig storageConfigFromEnv() {
    StorageConfig c;
    c.backend = env("STORAGE_BACKEND", "local");
    c.endpoint = env("S3_ENDPOINT");
    c.bucket = env("S3_BUCKET", "pyracms");
    c.accessKey = env("S3_ACCESS_KEY");
    c.secretKey = env("S3_SECRET_KEY");
    double t = std::atof(env("S3_TIMEOUT_S", "60").c_str());
    c.timeoutS = t > 0 && t <= 3600 ? t : 60;
    return c;
}

S3Endpoint parseS3Endpoint(const std::string &endpoint) {
    S3Endpoint e;
    auto scheme = endpoint.find("://");
    if (scheme == std::string::npos)
        return e;
    auto proto = endpoint.substr(0, scheme);
    if (proto != "http" && proto != "https")
        return e;
    auto slash = endpoint.find('/', scheme + 3);
    e.origin = endpoint.substr(0, slash);
    e.prefix = slash == std::string::npos ? "" : endpoint.substr(slash);
    while (!e.prefix.empty() && e.prefix.back() == '/')
        e.prefix.pop_back();
    e.valid = e.origin.size() > scheme + 3;
    return e;
}

static bool bucketNameOk(const std::string &b) {
    if (b.size() < 3 || b.size() > 63)
        return false;
    for (unsigned char c : b) {
        if (!std::islower(c) && !std::isdigit(c) && c != '-' && c != '.')
            return false;
    }
    return true;
}

std::string storageConfigError(const StorageConfig &c, bool production) {
    if (c.backend == "local")
        return "";
    if (c.backend != "s3")
        return "STORAGE_BACKEND must be local or s3";
    if (!parseS3Endpoint(c.endpoint).valid)
        return "STORAGE_BACKEND=s3 needs S3_ENDPOINT (http[s]://host:port)";
    if (!bucketNameOk(c.bucket))
        return "S3_BUCKET must be 3-63 chars of a-z 0-9 - .";
    if (production && (c.accessKey.empty() || c.secretKey.empty()))
        return "STORAGE_BACKEND=s3 needs S3_ACCESS_KEY and S3_SECRET_KEY";
    return "";
}

std::string startupStorageError() {
    return storageConfigError(storageConfigFromEnv(), isProduction());
}

} // namespace pyracms
