#include "controllers/FileController.h"

#include <drogon/utils/Utilities.h>
#include <algorithm>
#include <iomanip>
#include <map>
#include <openssl/sha.h>
#include <sstream>

namespace pyracms {

bool FileController::isImageMimetype(const std::string &mimetype) {
    return mimetype.find("image/") == 0;
}

bool FileController::isVideoMimetype(const std::string &mimetype) {
    return mimetype.find("video/") == 0;
}

std::string FileController::generateUuid() {
    return drogon::utils::getUuid();
}

std::string FileController::getUploadDir() {
    auto &config = drogon::app().getCustomConfig();
    if (config.isMember("upload_dir"))
        return config["upload_dir"].asString();
    return "./uploads";
}

std::string FileController::mimeFor(const std::string &filename) {
    static const std::map<std::string, std::string> known = {
        {"png", "image/png"},       {"jpg", "image/jpeg"},
        {"jpeg", "image/jpeg"},     {"gif", "image/gif"},
        {"webp", "image/webp"},     {"svg", "image/svg+xml"},
        {"mp4", "video/mp4"},       {"webm", "video/webm"},
        {"json", "application/json"}, {"txt", "text/plain"},
        {"zip", "application/zip"}, {"pdf", "application/pdf"},
    };
    auto dot = filename.rfind('.');
    if (dot == std::string::npos)
        return "application/octet-stream";
    auto ext = filename.substr(dot + 1);
    std::transform(ext.begin(), ext.end(), ext.begin(), ::tolower);
    auto it = known.find(ext);
    return it == known.end() ? "application/octet-stream" : it->second;
}

std::string FileController::sha256Hex(const std::string &data) {
    unsigned char d[SHA256_DIGEST_LENGTH];
    SHA256(reinterpret_cast<const unsigned char *>(data.data()),
           data.size(), d);
    std::ostringstream ss;
    for (unsigned char b : d)
        ss << std::hex << std::setw(2) << std::setfill('0') << int(b);
    return ss.str();
}

} // namespace pyracms
