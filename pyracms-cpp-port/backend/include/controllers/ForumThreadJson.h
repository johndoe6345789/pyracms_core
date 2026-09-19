#pragma once

#include "services/ForumDtos.h"
#include "services/ForumReactions.h"

namespace pyracms {

// GET /api/forum/threads/{id} body; every post carries `reactions`.
Json::Value threadJson(const ForumThreadWithPostsDto &d,
                       const ReactionMap &reactions);

} // namespace pyracms
