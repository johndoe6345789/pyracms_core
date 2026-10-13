#include "services/VideoSql.h"

namespace pyracms {

VideoDto videoRowToDto(const drogon::orm::Row &row) {
    VideoDto d;
    d.id = row["id"].as<int>();
    d.tenantId = row["tenant_id"].as<int>();
    d.userId = row["user_id"].isNull() ? 0 : row["user_id"].as<int>();
    d.username = row["username"].as<std::string>();
    d.title = row["title"].as<std::string>();
    d.description = row["description"].as<std::string>();
    d.fileUuid = row["file_uuid"].as<std::string>();
    d.thumbnailUuid = row["thumbnail_uuid"].as<std::string>();
    d.durationSeconds = row["duration_seconds"].as<int>();
    d.viewCount = row["view_count"].as<long long>();
    d.likes = row["likes"].as<int>();
    d.dislikes = row["dislikes"].as<int>();
    d.visibility = row["visibility"].as<std::string>();
    d.createdAt = row["created_at"].as<std::string>();
    d.myVote = row["my_vote"].as<std::string>();
    return d;
}

} // namespace pyracms
