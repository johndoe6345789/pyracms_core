#include "services/search/SearchServiceInternal.h"

#include <cctype>
#include <sstream>

namespace pyracms {

// Convert the user query to tsquery form: words joined with & (AND).
std::string toTsQuery(const std::string &query) {
    std::string tsQuery;
    std::string word;
    std::istringstream stream(query);
    bool first = true;
    while (stream >> word) {
        // Only letters/digits reach to_tsquery: its operator syntax
        // (& | ! ( ) : * <->) must never come from the user.
        std::string clean;
        for (unsigned char c : word) {
            if (std::isalnum(c) || c >= 0x80)
                clean += static_cast<char>(c);
        }
        if (clean.empty())
            continue;
        if (!first)
            tsQuery += " & ";
        tsQuery += clean + ":*";
        first = false;
    }
    return tsQuery;
}

} // namespace pyracms
