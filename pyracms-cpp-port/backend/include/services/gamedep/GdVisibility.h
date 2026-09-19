#pragma once

#include <json/json.h>
#include <string>

namespace pyracms {

// SQL boolean: the viewer ($3 = user id, 0 = anonymous) manages page p
// (its owner, an admin, or the owner of the page's site).
std::string gdManagerSql();
// SQL boolean: p is public (not private, has a published revision) or
// the viewer manages it. Anonymous callers therefore never see drafts.
std::string gdPageVisibleSql();

// Body -> is_private: accepts "isPrivate" (bool) or "visibility"
// ("public" | "private"). False when `has` stays untouched.
bool gdParseVisibility(const Json::Value &body, bool &isPrivate);

} // namespace pyracms
