#include "storage/LocalDiskStorage.h"

#include <drogon/drogon.h>
#include <filesystem>
#include <fstream>
#include <sstream>

namespace pyracms {

namespace fs = std::filesystem;

std::string defaultUploadDir() {
    auto &config = drogon::app().getCustomConfig();
    if (config.isMember("upload_dir"))
        return config["upload_dir"].asString();
    return "./uploads";
}

std::optional<std::string> LocalDiskStorage::path(const BlobKey &k) const {
    if (!blobIdValid(k.id))
        return std::string();
    return dir_() + (k.thumb ? "/thumbnails/" : "/") + k.id;
}

void LocalDiskStorage::put(const BlobKey &k, std::string data, DoneCb cb) {
    auto p = *path(k);
    if (p.empty())
        return cb(BlobStatus::Failed);
    std::error_code ec;
    fs::create_directories(fs::path(p).parent_path(), ec);
    std::ofstream out(p, std::ios::binary | std::ios::trunc);
    out.write(data.data(), static_cast<std::streamsize>(data.size()));
    out.close();
    cb(out.fail() ? BlobStatus::Failed : BlobStatus::Ok);
}

void LocalDiskStorage::get(const BlobKey &k, GetCb cb) {
    auto p = *path(k);
    std::ifstream in(p, std::ios::binary);
    if (p.empty() || !in)
        return cb(BlobStatus::NotFound, "");
    std::ostringstream ss;
    ss << in.rdbuf();
    cb(BlobStatus::Ok, ss.str());
}

void LocalDiskStorage::remove(const BlobKey &k, DoneCb cb) {
    auto p = *path(k);
    std::error_code ec;
    bool gone = !p.empty() && fs::remove(p, ec);
    cb(gone ? BlobStatus::Ok : BlobStatus::NotFound);
}

void LocalDiskStorage::exists(const BlobKey &k, DoneCb cb) {
    auto p = *path(k);
    std::error_code ec;
    cb(!p.empty() && fs::exists(p, ec) ? BlobStatus::Ok
                                        : BlobStatus::NotFound);
}

} // namespace pyracms
