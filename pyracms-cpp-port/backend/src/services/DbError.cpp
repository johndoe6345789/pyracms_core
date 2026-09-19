#include "services/DbError.h"

#include <trantor/utils/Logger.h>

namespace pyracms {

std::string dbError(const drogon::orm::DrogonDbException &e) {
    const std::exception &base = e.base();
    LOG_DEBUG << "database error: " << base.what();
    if (dynamic_cast<const drogon::orm::UniqueViolation *>(&base))
        return "Already exists";
    if (dynamic_cast<const drogon::orm::ForeignKeyViolation *>(&base))
        return "Referenced item does not exist";
    if (dynamic_cast<const drogon::orm::NotNullViolation *>(&base) ||
        dynamic_cast<const drogon::orm::CheckViolation *>(&base) ||
        dynamic_cast<const drogon::orm::DataException *>(&base))
        return "Invalid value";
    return "Database error";
}

} // namespace pyracms
