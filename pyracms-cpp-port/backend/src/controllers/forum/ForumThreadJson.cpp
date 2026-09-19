#include "controllers/ForumThreadJson.h"

namespace pyracms {

static Json::Value postJson(const ForumPostDto &p, const ReactionMap &rx) {
    Json::Value j;
    j["id"] = p.id;
    j["title"] = p.title;
    j["content"] = p.content;
    j["createdAt"] = p.createdAt;
    j["userId"] = p.userId;
    j["username"] = p.username;
    j["threadId"] = p.threadId;
    j["likes"] = p.likes;
    j["dislikes"] = p.dislikes;
    auto it = rx.find(p.id);
    j["reactions"] = it == rx.end() ? Json::Value(Json::arrayValue)
                                    : it->second;
    return j;
}

Json::Value threadJson(const ForumThreadWithPostsDto &d,
                       const ReactionMap &reactions) {
    const auto &t = d.thread;
    Json::Value r;
    r["id"] = t.id;
    r["name"] = t.name;
    r["description"] = t.description;
    r["forumId"] = t.forumId;
    r["viewCount"] = t.viewCount;
    r["totalPosts"] = t.totalPosts;
    r["createdAt"] = t.createdAt;
    r["userId"] = t.userId;
    r["authorUsername"] = t.authorUsername;
    r["lastPostAt"] = t.lastPostAt;
    r["forumName"] = t.forumName;
    r["pinned"] = t.pinned;
    r["locked"] = t.locked;
    Json::Value posts(Json::arrayValue);
    for (const auto &p : d.posts)
        posts.append(postJson(p, reactions));
    r["posts"] = posts;
    return r;
}

} // namespace pyracms
