#pragma once

#include "services/SearchService.h"

#include <json/json.h>

namespace pyracms {

// One search hit. Forum posts also carry `postId` and `threadId` so a
// client can link straight to the thread.
Json::Value searchItemJson(const SearchResultItem &item);

} // namespace pyracms
