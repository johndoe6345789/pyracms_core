#pragma once

namespace pyracms {

// Column for queries over gallery_albums aliased `a`: the file of the
// album's cover (a random image of the album in 'random' mode).
inline constexpr const char *kCoverUuidSql =
    "CASE WHEN a.cover_mode = 'random' THEN (SELECT p.file_uuid FROM "
    "gallery_pictures p JOIN files f ON f.uuid = p.file_uuid WHERE "
    "p.album_id = a.id AND f.mimetype LIKE 'image/%' ORDER BY random() "
    "LIMIT 1) ELSE (SELECT file_uuid FROM gallery_pictures WHERE id = "
    "a.default_picture_id) END AS cover_uuid, ";

} // namespace pyracms
