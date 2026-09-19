#include "services/gamedep/GdSql.h"
#include "services/gamedep/GdVisibility.h"

namespace pyracms {

std::string gdPageSql(bool publishedOnly, const std::string &where,
                      const std::string &tail) {
    return "SELECT jsonb_build_object("
           "'id', p.id, 'type', p.type, 'name', p.name, "
           "'displayName', p.display_name, "
           "'description', p.description, 'ownerId', p.owner_id, "
           "'owner', u.username, 'ownerUsername', u.username, "
           "'tenantId', p.tenant_id, 'createdAt', p.created_at, "
           "'viewCount', p.view_count, "
           "'isPrivate', p.is_private, 'visibility', "
           "CASE WHEN p.is_private THEN 'private' ELSE 'public' END, "
           "'likes', " + gdVotesSql(true) +
           ", 'dislikes', " + gdVotesSql(false) +
           ", 'downloadCount', " + gdDownloadsSql() +
           ", 'tags', " + gdTagsSql() +
           ", 'dependencies', " + gdDepsSql() +
           ", 'screenshots', " + gdShotsSql() +
           ", 'revisions', " + gdRevisionsSql(publishedOnly) +
           ")::text AS j FROM gamedep_pages p "
           "LEFT JOIN users u ON u.id = p.owner_id "
           "WHERE COALESCE(p.tenant_id, 0) = $1 AND " + gdPageVisibleSql() +
           " " + where + " " + tail;
}

} // namespace pyracms
