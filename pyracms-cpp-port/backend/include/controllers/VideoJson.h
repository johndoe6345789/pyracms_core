#pragma once

#include "services/VideoService.h"

#include <json/json.h>
#include <string>

namespace pyracms {

Json::Value videoJson(const VideoDto &v);
Json::Value tallyJson(const VoteTally &t);

// Overlays the members `body` sets onto `in`. Returns the first problem,
// "" when the result is valid.
std::string applyVideoInput(const Json::Value &body, VideoInput &in);

} // namespace pyracms
