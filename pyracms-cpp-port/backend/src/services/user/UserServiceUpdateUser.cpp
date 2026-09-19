#include "security/Validate.h"
#include "services/DbError.h"
#include "services/UserService.h"


namespace pyracms {

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
