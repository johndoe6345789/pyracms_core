#include "services/gamedep/GdSql.h"

namespace pyracms {

std::string gdBinariesSql() {
    return "(SELECT COALESCE(jsonb_agg(jsonb_build_object("
           "'id', b.id, 'os', o.name, 'arch', a.name, "
           "'osId', b.os_id, 'archId', b.arch_id, 'fileId', b.file_id, "
           "'fileUuid', f.uuid, 'uuid', f.uuid, "
           "'url', $2::text || '/api/files/' || f.uuid, "
           "'size', COALESCE(f.size, 0), "
           "'sha256', COALESCE(NULLIF(b.sha256, ''), f.sha256, ''), "
           "'executable', b.executable, "
           "'downloadCount', COALESCE(f.download_count, 0)) "
           "ORDER BY b.id), '[]'::jsonb) "
           "FROM gamedep_binaries b "
           "LEFT JOIN operating_systems o ON o.id = b.os_id "
           "LEFT JOIN architectures a ON a.id = b.arch_id "
           "LEFT JOIN files f ON f.id = b.file_id "
           "WHERE b.revision_id = r.id)";
}

} // namespace pyracms
