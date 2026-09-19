#include "services/DbError.h"

#include <trantor/utils/Logger.h>

namespace pyracms {

static bool has(const std::string &text, const char *needle) {
    return text.find(needle) != std::string::npos;
}

// The PostgreSQL driver reports failures as plain text, so the class of
// error is read from the server's standard message wording. Only the class
// is returned; the text itself (table and constraint names) is logged.
std::string dbError(const drogon::orm::DrogonDbException &e) {
    const std::string what = e.base().what();
    LOG_DEBUG << "database error: " << what;
    if (has(what, "duplicate key value"))
        return "Already exists";
    if (has(what, "violates foreign key constraint"))
        return "Referenced item does not exist";
    if (has(what, "violates not-null constraint") ||
        has(what, "violates check constraint") ||
        has(what, "value too long") || has(what, "invalid input syntax") ||
        has(what, "out of range"))
        return "Invalid value";
    return "Database error";
}

} // namespace pyracms
