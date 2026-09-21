#include "services/FileUploadService.h"

namespace pyracms {

using drogon::orm::DrogonDbException;
using drogon::orm::Result;

static const char *kCols =
    "id, s3_upload_id, file_uuid, filename, mimetype, expected_sha256, "
    "user_id, tenant_id, size";

static UploadRow toRow(const drogon::orm::Row &r) {
    UploadRow u;
    u.id = r["id"].as<std::string>();
    u.s3Id = r["s3_upload_id"].as<std::string>();
    u.fileUuid = r["file_uuid"].as<std::string>();
    u.filename = r["filename"].as<std::string>();
    u.mimetype = r["mimetype"].as<std::string>();
    u.expectedSha = r["expected_sha256"].as<std::string>();
    u.userId = r["user_id"].as<int>();
    u.tenantId = r["tenant_id"].as<int>();
    u.size = r["size"].as<int64_t>();
    return u;
}

static auto failed(FileUploadService::OkCb cb) {
    return [cb](const DrogonDbException &e) {
        LOG_WARN << "file_uploads query failed: " << e.base().what();
        cb(false);
    };
}

void FileUploadService::create(const Db &db, const UploadRow &u, OkCb cb) {
    db->execSqlAsync(
        "INSERT INTO file_uploads (id, s3_upload_id, file_uuid, filename, "
        "mimetype, expected_sha256, user_id, tenant_id, size) "
        "VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)",
        [cb](const Result &) { cb(true); }, failed(cb), u.id, u.s3Id,
        u.fileUuid, u.filename, u.mimetype, u.expectedSha, u.userId,
        u.tenantId, u.size);
}

void FileUploadService::countOpen(const Db &db, int userId, CountCb cb) {
    db->execSqlAsync(
        "SELECT count(*)::int AS n FROM file_uploads WHERE user_id = $1",
        [cb](const Result &r) { cb(r[0]["n"].as<int>()); },
        [cb](const DrogonDbException &) { cb(1 << 20); }, userId);
}

void FileUploadService::find(const Db &db, const std::string &id,
                             RowCb cb) {
    db->execSqlAsync(
        std::string("SELECT ") + kCols + " FROM file_uploads WHERE id = $1",
        [cb](const Result &r) {
            cb(r.empty() ? std::nullopt : std::optional(toRow(r[0])));
        },
        [cb](const DrogonDbException &) { cb(std::nullopt); }, id);
}

void FileUploadService::remove(const Db &db, const std::string &id,
                               OkCb cb) {
    db->execSqlAsync("DELETE FROM file_uploads WHERE id = $1",
                     [cb](const Result &) { cb(true); }, failed(cb), id);
}

void FileUploadService::expired(const Db &db, int hours, RowsCb cb) {
    db->execSqlAsync(
        std::string("SELECT ") + kCols +
            " FROM file_uploads WHERE created_at < NOW() - "
            "make_interval(hours => $1) LIMIT 100",
        [cb](const Result &r) {
            std::vector<UploadRow> out;
            for (auto &row : r)
                out.push_back(toRow(row));
            cb(out);
        },
        [cb](const DrogonDbException &) { cb({}); }, hours);
}

} // namespace pyracms
