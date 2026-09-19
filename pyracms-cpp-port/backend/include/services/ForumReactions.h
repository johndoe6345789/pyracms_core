#pragma once

#include <drogon/drogon.h>
#include <functional>
#include <map>
#include <string>

namespace pyracms {

// Emoji names a post can be reacted to with.
bool isAllowedEmoji(const std::string &emoji);

// post id -> [{emoji, count, mine}] for every reacted post of a thread.
// `viewerId` 0 (anonymous) makes every `mine` false.
using ReactionMap = std::map<int, Json::Value>;
void loadThreadReactions(const drogon::orm::DbClientPtr &db, int threadId,
                         int viewerId, std::function<void(ReactionMap)> cb);

// Same shape for one post.
void loadPostReactions(const drogon::orm::DbClientPtr &db, int postId,
                       int viewerId, std::function<void(Json::Value)> cb);

// Site of a post (thread -> forum -> category); 0 = no such post.
void tenantOfPost(const drogon::orm::DbClientPtr &db, int postId,
                  std::function<void(bool ok, int tenant)> cb);

// toggle = true flips the caller's reaction; false removes it.
void setReaction(const drogon::orm::DbClientPtr &db, int postId, int userId,
                 const std::string &emoji, bool toggle,
                 std::function<void(bool ok)> cb);

} // namespace pyracms
