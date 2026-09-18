#include "services/ForumService.h"
#include "services/forum/ForumServiceInternal.h"

namespace pyracms {

// --- Categories ---
void ForumService::listCategories(
    const DbClientPtr &db, int tenantId,
    std::function<void(const std::vector<ForumCategoryWithForumsDto> &)> cb) {

    db->execSqlAsync(
        "SELECT c.id AS cat_id, c.name AS cat_name, "
        "f.id, f.name, f.description, f.category_id, "
        "COALESCE(f.total_threads, 0) AS total_threads, "
        "COALESCE(f.total_posts, 0) AS total_posts "
        "FROM forum_categories c "
        "LEFT JOIN forums f ON f.category_id = c.id "
        "WHERE c.tenant_id = $1 "
        "ORDER BY c.name, f.name",
        [cb](const drogon::orm::Result &result) {
            std::vector<ForumCategoryWithForumsDto> categories;
            int currentCatId = -1;

            for (const auto &row : result) {
                int catId = row["cat_id"].as<int>();
                if (catId != currentCatId) {
                    ForumCategoryWithForumsDto catDto;
                    catDto.category.id = catId;
                    catDto.category.name = row["cat_name"].as<std::string>();
                    categories.push_back(catDto);
                    currentCatId = catId;
                }

                if (!row["id"].isNull()) {
                    ForumDto forum;
                    forum.id = row["id"].as<int>();
                    forum.name = row["name"].as<std::string>();
                    forum.description =
                        row["description"].isNull()
                            ? ""
                            : row["description"].as<std::string>();
                    forum.categoryId = row["category_id"].as<int>();
                    forum.totalThreads = row["total_threads"].as<int>();
                    forum.totalPosts = row["total_posts"].as<int>();
                    categories.back().forums.push_back(forum);
                }
            }
            cb(categories);
        },
        [cb](const drogon::orm::DrogonDbException &) { cb({}); }, tenantId);
}

} // namespace pyracms
