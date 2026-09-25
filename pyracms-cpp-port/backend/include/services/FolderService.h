#pragma once

#include <drogon/drogon.h>
#include <functional>
#include <string>
#include <vector>

namespace pyracms {

// Folders of a site's files (paths already normalised by the caller).
class FolderService {
  public:
    using DbClientPtr = drogon::orm::DbClientPtr;
    using BoolCallback =
        std::function<void(bool success, const std::string &error)>;
    // Every folder, made on purpose or implied by a file in it, sorted.
    void list(const DbClientPtr &db, int tenantId,
              std::function<void(const std::vector<std::string> &)> cb);
    void create(const DbClientPtr &db, int tenantId, const std::string &path,
                BoolCallback cb);
    // Only an empty folder (no files, no subfolders) can be removed.
    void remove(const DbClientPtr &db, int tenantId, const std::string &path,
                BoolCallback cb);
    // Puts the file in `folder` ("" = top). False when there is no such file.
    void move(const DbClientPtr &db, const std::string &uuid,
              const std::string &folder, BoolCallback cb);
};

} // namespace pyracms
