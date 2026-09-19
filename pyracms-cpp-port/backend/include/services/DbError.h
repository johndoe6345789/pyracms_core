#pragma once

#include <drogon/orm/Exception.h>
#include <string>

namespace pyracms {

// Client-safe text for a failed query. The SQL error itself (table and
// constraint names, statement text) is only logged, never returned.
std::string dbError(const drogon::orm::DrogonDbException &e);

} // namespace pyracms
