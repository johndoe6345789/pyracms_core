#include "services/gamedep/GdSql.h"
#include "services/gamedep/GdVisibility.h"

namespace pyracms {

std::string gdRevisionsSql(bool publishedOnly) {
    // Unpublished revisions are visible to the page owner and admins.
    // ($3 stays referenced so Postgres can type every shared param.)
    std::string vis =
        publishedOnly
            ? "AND r.published AND $3::int >= 0 "
            : "AND (r.published OR " + gdManagerSql() + ") ";
    return "(SELECT COALESCE(jsonb_agg(jsonb_build_object("
           "'id', r.id, 'pageId', r.page_id, 'version', r.version, "
           "'moduleType', r.module_type, 'published', r.published, "
           "'createdAt', r.created_at, 'fileId', r.file_id, "
           "'fileUuid', sf.uuid, 'uuid', sf.uuid, "
           "'url', CASE WHEN sf.uuid IS NULL THEN NULL ELSE "
           "$2::text || '/api/files/' || sf.uuid END, "
           "'size', COALESCE(sf.size, 0), "
           "'sha256', COALESCE(sf.sha256, ''), "
           "'executable', r.executable, "
           "'downloadCount', COALESCE(sf.download_count, 0), "
           "'binaries', " +
           gdBinariesSql() +
           ") ORDER BY r.created_at DESC, r.id DESC), '[]'::jsonb) "
           "FROM gamedep_revisions r "
           "LEFT JOIN files sf ON sf.id = r.file_id "
           "WHERE r.page_id = p.id " +
           vis + ")";
}

} // namespace pyracms
