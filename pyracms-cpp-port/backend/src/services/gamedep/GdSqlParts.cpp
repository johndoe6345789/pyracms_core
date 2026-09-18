#include "services/gamedep/GdSql.h"

namespace pyracms {

std::string gdDepsSql() {
    return "(SELECT COALESCE(jsonb_agg(jsonb_build_object("
           "'id', d.id, 'name', d.name, 'version', d.version, "
           "'kind', d.kind, 'source', d.kind, "
           "'depRevisionId', d.dep_revision_id) ORDER BY d.id), "
           "'[]'::jsonb) FROM gamedep_dependencies d "
           "WHERE d.game_id = p.id)";
}

std::string gdShotsSql() {
    return "(SELECT COALESCE(jsonb_agg(jsonb_build_object("
           "'id', s.id, 'fileId', s.file_id, 'uuid', f.uuid, "
           "'url', $2::text || '/api/files/' || f.uuid, "
           "'thumbnail', $2::text || '/api/files/' || f.uuid || "
           "'/thumbnail', 'default', s.is_default) "
           "ORDER BY s.position, s.id), '[]'::jsonb) "
           "FROM gamedep_screenshots s JOIN files f ON f.id = s.file_id "
           "WHERE s.page_id = p.id)";
}

std::string gdTagsSql() {
    return "(SELECT COALESCE(jsonb_agg(t.name ORDER BY t.id), "
           "'[]'::jsonb) FROM gamedep_tags t WHERE t.page_id = p.id)";
}

std::string gdVotesSql(bool like) {
    return std::string("(SELECT COUNT(*) FROM gamedep_votes v "
                       "WHERE v.page_id = p.id AND v.is_like = ") +
           (like ? "TRUE)" : "FALSE)");
}

std::string gdDownloadsSql() {
    return "(SELECT COALESCE(SUM(f.download_count), 0) FROM files f "
           "WHERE f.id IN (SELECT b.file_id FROM gamedep_binaries b "
           "JOIN gamedep_revisions r ON r.id = b.revision_id "
           "WHERE r.page_id = p.id UNION SELECT r.file_id FROM "
           "gamedep_revisions r WHERE r.page_id = p.id))";
}

} // namespace pyracms
