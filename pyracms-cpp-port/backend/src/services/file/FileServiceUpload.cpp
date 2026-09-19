#include "services/FileService.h"
#include "services/DbError.h"

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
    dto.sha256 = row["sha256"].as<std::string>();
    if (!row["tenant_id"].isNull())
        dto.tenantId = row["tenant_id"].as<int>();
    dto.storage = row["storage"].as<std::string>();
    return dto;
}

void FileService::uploadFile(const DbClientPtr &db,
                             const std::string &filename,
                             const std::string &uuid,
                             const std::string &mimetype, int64_t size,
                             bool isPicture, bool isVideo, BoolCallback cb,
                             const std::string &sha256, int userId,
                             int tenantId, const std::string &storage) {
    db->execSqlAsync(
        "INSERT INTO files (filename, uuid, mimetype, size, is_picture, "
        "is_video, download_count, sha256, created_at, user_id, tenant_id, "
        "storage) "
        "VALUES ($1, $2, $3, $4, $5, $6, 0, $7, NOW(), NULLIF($8::int, 0), "
        "NULLIF($9::int, 0), $10) RETURNING id",
        [cb](const drogon::orm::Result &) { cb(true, ""); },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, dbError(e));
        },
        filename, uuid, mimetype, size, isPicture, isVideo, sha256, userId,
        tenantId, storage);
}

} // namespace pyracms
