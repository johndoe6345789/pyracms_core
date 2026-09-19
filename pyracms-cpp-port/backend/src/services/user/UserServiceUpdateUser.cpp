#include "security/Validate.h"
#include "services/DbError.h"
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

void UserService::updateUser(const DbClientPtr &db, int id,
                             const Json::Value &updates, BoolCallback cb) {
    auto problem = updateProblem(updates);
    if (!problem.empty()) {
        cb(false, problem);
        return;
    }
    // Each field travels as (value, present): a field that was not sent
    // keeps its stored value.
    bool hasAny = false;
    auto val = [&](const char *key) {
        hasAny = hasAny || updates.isMember(key);
        return updates.isMember(key) ? updates[key].asString()
                                     : std::string();
    };
    auto fullName = val("fullName"), email = val("email"),
         website = val("website"), aboutme = val("aboutme"),
         timezone = val("timezone");
    if (!hasAny) {
        cb(false, "No fields to update");
        return;
    }
    db->execSqlAsync(
        "UPDATE users SET "
        "full_name = CASE WHEN $2::bool THEN $1::text ELSE full_name END, "
        "email = CASE WHEN $4::bool THEN $3::text ELSE email END, "
        "website = CASE WHEN $6::bool THEN $5::text ELSE website END, "
        "aboutme = CASE WHEN $8::bool THEN $7::text ELSE aboutme END, "
        "timezone = CASE WHEN $10::bool THEN $9::text ELSE timezone END "
        "WHERE id = $11::int",
        [cb](const drogon::orm::Result &) { cb(true, ""); },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, dbError(e));
        },
        fullName, updates.isMember("fullName"), email,
        updates.isMember("email"), website, updates.isMember("website"),
        aboutme, updates.isMember("aboutme"), timezone,
        updates.isMember("timezone"), id);
}

} // namespace pyracms
