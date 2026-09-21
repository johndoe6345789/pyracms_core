#include "services/FileUploadService.h"

namespace pyracms {

using drogon::orm::DrogonDbException;
using drogon::orm::Result;

void FileUploadService::parts(const Db &db, const std::string &id,
                              PartsCb cb) {
    db->execSqlAsync(
        "SELECT part_no, size, etag, state_hex FROM file_upload_parts "
        "WHERE upload_id = $1 ORDER BY part_no",
        [cb](const Result &r) {
            std::vector<PartRow> out;
            for (auto &row : r)
                out.push_back({row["part_no"].as<int>(),
                               row["size"].as<int64_t>(),
                               row["etag"].as<std::string>(),
                               row["state_hex"].as<std::string>()});
            cb(out);
        },
        [cb](const DrogonDbException &) { cb({}); }, id);
}

void FileUploadService::savePart(const Db &db, const std::string &id,
                                 const PartRow &p, OkCb cb) {
    db->execSqlAsync(
        "INSERT INTO file_upload_parts (upload_id, part_no, size, etag, "
        "state_hex) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (upload_id, part_no) "
        "DO UPDATE SET size = EXCLUDED.size, etag = EXCLUDED.etag, "
        "state_hex = EXCLUDED.state_hex",
        [cb](const Result &) { cb(true); },
        [cb](const DrogonDbException &) { cb(false); }, id, p.no, p.size,
        p.etag, p.stateHex);
}

} // namespace pyracms
