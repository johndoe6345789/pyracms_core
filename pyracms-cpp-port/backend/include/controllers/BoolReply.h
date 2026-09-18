#pragma once

#include <drogon/HttpResponse.h>
#include <functional>
#include <string>

namespace pyracms {

using HttpCb = std::function<void(const drogon::HttpResponsePtr &)>;
using BoolCb = std::function<void(bool, const std::string &)>;

// Adapter from a service BoolCallback to an HTTP reply:
// success -> {"success":true}, "Not found" -> 404, other error -> 400.
BoolCb boolReply(HttpCb callback);

} // namespace pyracms
