#pragma once

#include "services/upload/UploadPlan.h"

#include <drogon/drogon.h>
#include <functional>
#include <optional>
#include <vector>

namespace pyracms {

// A chunked upload in flight (table file_uploads).
struct UploadRow {
    std::string id;       // what the client holds
    std::string s3Id;     // the object store's multipart id
    std::string fileUuid; // becomes files.uuid and the object key
    std::string filename;
    std::string mimetype;
    std::string expectedSha; // "" = client gave none
    int userId{0};
    int tenantId{0};
    int64_t size{0}; // declared total
};

class FileUploadService {
  public:
    using Db = drogon::orm::DbClientPtr;
    using OkCb = std::function<void(bool)>;
    using RowCb = std::function<void(const std::optional<UploadRow> &)>;
    using RowsCb = std::function<void(const std::vector<UploadRow> &)>;
    using PartsCb = std::function<void(const std::vector<PartRow> &)>;
    using CountCb = std::function<void(int)>;

    void create(const Db &db, const UploadRow &u, OkCb cb);
    void countOpen(const Db &db, int userId, CountCb cb);
    void find(const Db &db, const std::string &id, RowCb cb);
    void parts(const Db &db, const std::string &id, PartsCb cb);
    void savePart(const Db &db, const std::string &id, const PartRow &p,
                  OkCb cb);
    void remove(const Db &db, const std::string &id, OkCb cb);
    // Uploads older than `hours`.
    void expired(const Db &db, int hours, RowsCb cb);
};

} // namespace pyracms
