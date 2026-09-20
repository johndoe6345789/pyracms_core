#pragma once

#include <drogon/HttpRequest.h>
#include <drogon/HttpResponse.h>
#include <functional>

namespace pyracms {

// Creating articles is a Moderator-and-up (or site owner) action; plain
// members comment and post in the forum but do not publish pages.
void mayWriteArticles(const drogon::HttpRequestPtr &req, int tenantId,
                      std::function<void(bool)> done);

// 403 reply for a refused article write.
drogon::HttpResponsePtr articleForbidden();

} // namespace pyracms
