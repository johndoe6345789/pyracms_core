#pragma once

#include "services/VideoDtos.h"

#include <drogon/orm/Field.h>
#include <drogon/orm/Row.h>
#include <string>

namespace pyracms {

// SELECT of a video with its uploader and vote counts. `source` is a
// table or CTE aliased as v; `viewer` is the placeholder of the viewer id
// (for my_vote). Extra columns go in `extra` (leading comma).
inline std::string videoSelect(const std::string &source,
                               const std::string &viewer,
                               const std::string &extra = "") {
    return "SELECT v.*, COALESCE(u.username, '') AS username, "
           "(SELECT COUNT(*) FROM video_votes x WHERE x.video_id = v.id "
           "AND x.is_like) AS likes, "
           "(SELECT COUNT(*) FROM video_votes x WHERE x.video_id = v.id "
           "AND NOT x.is_like) AS dislikes, "
           "COALESCE((SELECT CASE WHEN x.is_like THEN 'like' ELSE "
           "'dislike' END FROM video_votes x WHERE x.video_id = v.id AND "
           "x.user_id = " +
           viewer + "::int), '') AS my_vote" + extra + " FROM " + source +
           " v LEFT JOIN users u ON u.id = v.user_id ";
}

// Who may see a video row (aliases videos as bare columns): $2 site
// (0 = any), $3 viewer, $4 any visibility.
inline constexpr const char *kVideoVisible =
    "($2::int = 0 OR tenant_id = $2::int) AND ($4::bool OR "
    "visibility <> 'private' OR user_id = $3::int)";

// ILIKE pattern matching `text` literally anywhere.
inline std::string likePattern(const std::string &text) {
    std::string out = "%";
    for (char c : text) {
        if (c == '%' || c == '_' || c == '\\')
            out += '\\';
        out += c;
    }
    return out + "%";
}

VideoDto videoRowToDto(const drogon::orm::Row &row);

} // namespace pyracms
