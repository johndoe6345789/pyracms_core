#pragma once

#include <string>

namespace pyracms {

// SQL fragments building the catalog JSON in Postgres. Shared params:
// $1 tenant scope, $2 url base, $3 viewer id. Fragments reference the
// outer aliases p (gamedep_pages) and r (gamedep_revisions).
std::string gdBinariesSql();
std::string gdRevisionsSql(bool publishedOnly);
std::string gdDepsSql();
std::string gdShotsSql();
std::string gdTagsSql();
std::string gdVotesSql(bool like);
std::string gdDownloadsSql();
// "SELECT <page json>::text AS j FROM ... WHERE <where> <tail>"
std::string gdPageSql(bool publishedOnly, const std::string &where,
                      const std::string &tail);

} // namespace pyracms
