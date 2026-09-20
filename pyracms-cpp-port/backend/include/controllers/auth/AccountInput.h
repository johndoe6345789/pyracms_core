#pragma once

#include "services/AuthService.h"
#include "security/Validate.h"

#include <json/json.h>
#include <string>

namespace pyracms {

// Empty string when the account fields are fine, else the message for a
// 400. Shared by sign-up, first-run setup and site creation.
inline std::string accountProblem(const Json::Value &j) {
    if (!j.isObject() || !j["username"].isString() ||
        !j["email"].isString() || !j["password"].isString())
        return "username, email, and password required";
    if (j.isMember("fullName") && !j["fullName"].isString())
        return "fullName must be text";
    if (!isValidUsername(j["username"].asString()))
        return "Username must be 3-32 letters, digits, '_', '.' or '-'";
    if (!isValidEmail(j["email"].asString()))
        return "A valid email address is required";
    auto password = j["password"].asString();
    if (password.length() < 8)
        return "Password must be at least 8 characters";
    if (password.length() > AuthService::kMaxPasswordLen)
        return "Password is too long";
    auto full = j.get("fullName", "").asString();
    if (full.size() > 128 || hasControlChars(full))
        return "Invalid full name";
    return "";
}

} // namespace pyracms
