#include "services/FileService.h"

namespace pyracms {

FileDto FileService::rowToDto(const drogon::orm::Row &row) {
    FileDto dto;
    dto.id = row["id"].as<int>();
    dto.filename = row["filename"].as<std::string>();
    dto.uuid = row["uuid"].as<std::string>();
    dto.mimetype = row["mimetype"].as<std::string>();
    dto.size = row["size"].as<int64_t>();
    dto.createdAt = row["created_at"].as<std::string>();
    dto.isPicture = row["is_picture"].as<bool>();
    dto.isVideo = row["is_video"].as<bool>();
    dto.downloadCount = row["download_count"].as<int>();
    return dto;
}

void FileService::uploadFile(const DbClientPtr &db,
                              const std::string &filename,
                              const std::string &uuid,
                              const std::string &mimetype,
                              int64_t size,
                              bool isPicture,
                              bool isVideo,
                              BoolCallback cb) {
    db->execSqlAsync(
        "INSERT INTO files (filename, uuid, mimetype, size, is_picture, "
        "is_video, download_count, created_at) "
        "VALUES ($1, $2, $3, $4, $5, $6, 0, NOW()) "
        "RETURNING id",
        [cb](const drogon::orm::Result &result) {
            cb(true, "");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        filename, uuid, mimetype, size, isPicture, isVideo);
}

void FileService::getFile(const DbClientPtr &db,
                           const std::string &uuid,
                           Callback cb) {
    db->execSqlAsync(
        "SELECT * FROM files WHERE uuid = $1",
        [this, cb](const drogon::orm::Result &result) {
            if (result.empty()) {
                cb(std::nullopt);
            } else {
                cb(rowToDto(result[0]));
            }
        },
        [cb](const drogon::orm::DrogonDbException &) {
            cb(std::nullopt);
        },
        uuid);
}

void FileService::deleteFile(const DbClientPtr &db,
                              const std::string &uuid,
                              BoolCallback cb) {
    db->execSqlAsync(
        "DELETE FROM files WHERE uuid = $1",
        [cb](const drogon::orm::Result &) {
            cb(true, "");
        },
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
            for (const auto &row : result) {
                files.push_back(rowToDto(row));
            }
            cb(files);
        },
        [cb](const drogon::orm::DrogonDbException &) {
            cb({});
        },
        limit, offset);
}

void FileService::incrementDownloadCount(const DbClientPtr &db,
                                          const std::string &uuid,
                                          BoolCallback cb) {
    db->execSqlAsync(
        "UPDATE files SET download_count = download_count + 1 WHERE uuid = $1",
        [cb](const drogon::orm::Result &) {
            cb(true, "");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        uuid);
}

} // namespace pyracms
