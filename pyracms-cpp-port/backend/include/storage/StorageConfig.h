#pragma once

#include <string>

namespace pyracms {

// Storage backend settings, read from the environment only (never from a
// request): STORAGE_BACKEND=local|s3, S3_ENDPOINT, S3_BUCKET,
// S3_ACCESS_KEY, S3_SECRET_KEY, S3_TIMEOUT_S.
struct StorageConfig {
    std::string backend{"local"};
    std::string endpoint;
    std::string bucket{"pyracms"};
    std::string accessKey;
    std::string secretKey;
    double timeoutS{60};
};

StorageConfig storageConfigFromEnv();

// "http://host:9000/prefix/" -> origin "http://host:9000", prefix "/prefix".
struct S3Endpoint {
    std::string origin;
    std::string prefix;
    bool valid{false};
};
S3Endpoint parseS3Endpoint(const std::string &endpoint);

// Why the server must refuse to start ("" when fine). Credentials are only
// mandatory in production.
std::string storageConfigError(const StorageConfig &c, bool production);

// storageConfigError() for the current environment (startup gate).
std::string startupStorageError();

} // namespace pyracms
