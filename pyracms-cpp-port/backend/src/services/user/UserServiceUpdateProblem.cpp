#include "security/Validate.h"
#include "services/UserService.h"

namespace pyracms {

static bool okTimezone(const std::string &s) {
    if (s.empty() || s.size() > 64)
        return false;
    for (unsigned char c : s) {
        if (!std::isalnum(c) && c != '_' && c != '/' && c != '+' &&
            c != '-' && c != ':')
            return false;
    }
    return true;
}

static bool okWebsite(const std::string &s) {
    if (s.empty())
        return true;
    return s.size() <= 256 && !hasControlChars(s) && s.find(' ') == s.npos &&
           (s.rfind("http://", 0) == 0 || s.rfind("https://", 0) == 0);
}

// Only these five profile fields can ever be written here: role, banned,
// tenant_id, password_hash and the rest are not reachable from a request.
std::string UserService::updateProblem(const Json::Value &u) {
    if (!u.isObject())
        return "Invalid JSON body";
    for (const char *k :
         {"fullName", "email", "website", "aboutme", "timezone"}) {
        if (u.isMember(k) && !u[k].isString())
            return std::string(k) + " must be text";
    }
    if (u.isMember("fullName") && (u["fullName"].asString().size() > 128 ||
                                   hasControlChars(u["fullName"].asString())))
        return "Invalid full name";
    if (u.isMember("email") && !isValidEmail(u["email"].asString()))
        return "A valid email address is required";
    if (u.isMember("website") && !okWebsite(u["website"].asString()))
        return "Website must be an http(s) URL";
    if (u.isMember("aboutme") && u["aboutme"].asString().size() > 5000)
        return "About me is too long";
    if (u.isMember("timezone") && !okTimezone(u["timezone"].asString()))
        return "Invalid timezone";
    return "";
}

} // namespace pyracms
