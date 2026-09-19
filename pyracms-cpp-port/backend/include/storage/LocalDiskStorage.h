#pragma once

#include "storage/BlobStorage.h"

namespace pyracms {

// Upload directory from the app's custom config ("upload_dir").
std::string defaultUploadDir();

// Files on local disk: <dir>/<uuid> and <dir>/thumbnails/<uuid>. The tenant
// is not part of the path, so files stay put across backend switches.
class LocalDiskStorage : public BlobStorage {
  public:
    using DirFn = std::function<std::string()>;
    explicit LocalDiskStorage(DirFn dir = defaultUploadDir)
        : dir_(std::move(dir)) {}
    const char *name() const override { return "local"; }
    void put(const BlobKey &k, std::string data, DoneCb cb) override;
    void get(const BlobKey &k, GetCb cb) override;
    void remove(const BlobKey &k, DoneCb cb) override;
    void exists(const BlobKey &k, DoneCb cb) override;
    std::optional<std::string> path(const BlobKey &k) const override;

  private:
    DirFn dir_;
};

} // namespace pyracms
