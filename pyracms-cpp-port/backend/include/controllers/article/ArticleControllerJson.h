#pragma once

#include "services/ArticleService.h"

#include <json/json.h>
#include <string>
#include <vector>

namespace pyracms {

// Single-article response body. `full` adds publishedAt/scheduledAt
// (omitted when the author lookup failed, as before).
Json::Value articleJson(const ArticleDto &article, const std::string &username,
                        const std::vector<ArticleRevisionDto> &revisions,
                        const std::vector<std::string> &tags, bool full);

} // namespace pyracms
