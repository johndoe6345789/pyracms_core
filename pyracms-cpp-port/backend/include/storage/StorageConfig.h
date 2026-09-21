#pragma once

#include <string>

namespace pyracms {

// Storage backend settings, read from the environment only (never from a
// request): STORAGE_BACKEND=local|s3, S3_ENDPOINT, S3_BUCKET,
// S3_ACCESS_KEY, S3_SECRET_KEY, S3_REGION (default us-east-1), S3_TIMEOUT_S,
// S3_PRESIGNED_DOWNLOADS=1 + S3_PUBLIC_ENDPOINT (optional presigned GETs).
// Requests are always signed with AWS Signature V4.
struct StorageConfig {
    std::string backend{"local"};
    std::string endpoint;
    std::string bucket{"pyracms"};
    std::string accessKey;
    std::string secretKey;
    std::string region{"us-east-1"};
    std::string publicEndpoint; // externally reachable store URL
    bool presignedDownloads{false};
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
