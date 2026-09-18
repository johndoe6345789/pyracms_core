#include "services/FileService.h"

namespace pyracms {

void FileService::getFile(const DbClientPtr &db, const std::string &uuid,
                          Callback cb) {
    db->execSqlAsync(
        "SELECT * FROM files WHERE uuid = $1",
        [this, cb](const drogon::orm::Result &result) {
            if (result.empty())
                cb(std::nullopt);
            else
                cb(rowToDto(result[0]));
        },
        [cb](const drogon::orm::DrogonDbException &) { cb(std::nullopt); },
        uuid);
}

void FileService::deleteFile(const DbClientPtr &db, const std::string &uuid,
                             BoolCallback cb) {
    db->execSqlAsync(
        "DELETE FROM files WHERE uuid = $1",
        [cb](const drogon::orm::Result &) { cb(true, ""); },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        uuid);
}

void FileService::listFiles(const DbClientPtr &db, int limit, int offset,
                            ListCallback cb) {
    db->execSqlAsync(
        "SELECT * FROM files ORDER BY created_at DESC LIMIT $1 OFFSET $2",
        [this, cb](const drogon::orm::Result &result) {
            std::vector<FileDto> files;
            files.reserve(result.size());
            for (const auto &row : result)
                files.push_back(rowToDto(row));
            cb(files);
        },
        [cb](const drogon::orm::DrogonDbException &) { cb({}); }, limit,
        offset);
}

void FileService::incrementDownloadCount(const DbClientPtr &db,
                                         const std::string &uuid,
                                         BoolCallback cb) {
    db->execSqlAsync(
        "UPDATE files SET download_count = download_count + 1 "
        "WHERE uuid = $1",
        [cb](const drogon::orm::Result &) { cb(true, ""); },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        uuid);
}

} // namespace pyracms
