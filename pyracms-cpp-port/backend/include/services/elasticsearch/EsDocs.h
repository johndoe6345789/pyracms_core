#pragma once

#include <drogon/orm/Field.h>
#include <drogon/orm/Row.h>
#include <json/json.h>
#include <string>

namespace pyracms {

// "type:id,type:id" as one SQL parameter (see EsDrain.cpp).
inline constexpr const char *kUnpackKeys =
    "SELECT split_part(x, ':', 1) AS doc_type, "
    "split_part(x, ':', 2)::int AS doc_id "
    "FROM unnest(string_to_array($1, ',')) x";

// One search_documents row as the two NDJSON lines a bulk index needs.
std::string esIndexLines(const drogon::orm::Row &row);
// The bulk line that removes a document.
std::string esDeleteLine(const std::string &key);
// Postgres timestamps ("2026-09-19 01:57:16.4+00") as ISO 8601.
std::string esIsoDate(std::string s);
// True when a _bulk reply reports any failed item.
bool esBulkFailed(const Json::Value &reply);

} // namespace pyracms
