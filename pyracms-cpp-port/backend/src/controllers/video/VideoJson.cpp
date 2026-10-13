#include "controllers/VideoJson.h"

namespace pyracms {

Json::Value videoJson(const VideoDto &v) {
    Json::Value j;
    j["id"] = v.id;
    j["tenantId"] = v.tenantId;
    j["userId"] = v.userId;
    j["username"] = v.username;
    j["title"] = v.title;
    j["description"] = v.description;
    j["fileUuid"] = v.fileUuid;
    j["thumbnailUuid"] = v.thumbnailUuid;
    j["durationSeconds"] = v.durationSeconds;
    j["viewCount"] = static_cast<Json::Int64>(v.viewCount);
    j["likes"] = v.likes;
    j["dislikes"] = v.dislikes;
    j["visibility"] = v.visibility;
    j["createdAt"] = v.createdAt;
    return j;
}

Json::Value tallyJson(const VoteTally &t) {
    Json::Value j;
    j["likes"] = t.likes;
    j["dislikes"] = t.dislikes;
    j["myVote"] = t.myVote;
    return j;
}

} // namespace pyracms
