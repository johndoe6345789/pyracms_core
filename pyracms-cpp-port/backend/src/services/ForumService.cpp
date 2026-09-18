#include "services/ForumService.h"

namespace pyracms {

namespace {
const char *kThreadCols =
    "t.id, t.name, t.description, t.forum_id, "
    "COALESCE(t.view_count, 0) AS view_count, "
    "COALESCE(t.total_posts, 0) AS total_posts, "
    "t.created_at, COALESCE(t.user_id, 0) AS user_id, "
    "COALESCE(u.username, (SELECT u2.username FROM forum_posts p2 "
    "JOIN users u2 ON u2.id = p2.user_id WHERE p2.thread_id = t.id "
    "ORDER BY p2.created_at ASC LIMIT 1), '') AS username, "
    "COALESCE((SELECT MAX(p3.created_at) FROM forum_posts p3 "
    "WHERE p3.thread_id = t.id), t.created_at) AS last_post_at, "
    "t.is_pinned, t.is_locked, "
    "COALESCE((SELECT f.name FROM forums f WHERE f.id = t.forum_id), '') "
    "AS forum_name ";
const char *kThreadFrom =
    "FROM forum_threads t LEFT JOIN users u ON u.id = t.user_id ";
// $1 = acting user id: owner of the row, or moderator (role >= 2).
const char *kOwnerOrMod =
    "(user_id = $1::int OR EXISTS "
    "(SELECT 1 FROM users mu WHERE mu.id = $1::int AND mu.role >= 2))";
} // namespace

ForumCategoryDto ForumService::rowToCategoryDto(const drogon::orm::Row &row) {
    ForumCategoryDto dto;
    dto.id = row["id"].as<int>();
    dto.name = row["name"].as<std::string>();
    return dto;
}

ForumDto ForumService::rowToForumDto(const drogon::orm::Row &row) {
    ForumDto dto;
    dto.id = row["id"].as<int>();
    dto.name = row["name"].as<std::string>();
    dto.description = row["description"].isNull() ? "" : row["description"].as<std::string>();
    dto.categoryId = row["category_id"].as<int>();
    dto.totalThreads = row["total_threads"].isNull() ? 0 : row["total_threads"].as<int>();
    dto.totalPosts = row["total_posts"].isNull() ? 0 : row["total_posts"].as<int>();
    return dto;
}

ForumThreadDto ForumService::rowToThreadDto(const drogon::orm::Row &row) {
    ForumThreadDto dto;
    dto.id = row["id"].as<int>();
    dto.name = row["name"].as<std::string>();
    dto.description = row["description"].isNull() ? "" : row["description"].as<std::string>();
    dto.forumId = row["forum_id"].as<int>();
    dto.viewCount = row["view_count"].as<int>();
    dto.totalPosts = row["total_posts"].as<int>();
    dto.createdAt = row["created_at"].as<std::string>();
    dto.userId = row["user_id"].as<int>();
    dto.authorUsername = row["username"].as<std::string>();
    dto.lastPostAt = row["last_post_at"].as<std::string>();
    dto.forumName = row["forum_name"].as<std::string>();
    dto.pinned = row["is_pinned"].as<bool>();
    dto.locked = row["is_locked"].as<bool>();
    return dto;
}

ForumPostDto ForumService::rowToPostDto(const drogon::orm::Row &row) {
    ForumPostDto dto;
    dto.id = row["id"].as<int>();
    dto.title = row["title"].isNull() ? "" : row["title"].as<std::string>();
    dto.content = row["content"].as<std::string>();
    dto.createdAt = row["created_at"].as<std::string>();
    dto.userId = row["user_id"].isNull() ? 0 : row["user_id"].as<int>();
    dto.username = row["username"].isNull() ? "" : row["username"].as<std::string>();
    dto.threadId = row["thread_id"].as<int>();
    return dto;
}

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
                    forum.description = row["description"].isNull()
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
        [cb](const drogon::orm::DrogonDbException &) {
            cb({});
        },
        tenantId);
}

void ForumService::createCategory(const DbClientPtr &db, int tenantId,
                                   const std::string &name,
                                   BoolCallback cb) {
    db->execSqlAsync(
        "INSERT INTO forum_categories (name, tenant_id) VALUES ($1, $2) RETURNING id",
        [cb](const drogon::orm::Result &) {
            cb(true, "");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        name, tenantId);
}

void ForumService::updateCategory(const DbClientPtr &db, int id,
                                   const std::string &name,
                                   BoolCallback cb) {
    db->execSqlAsync(
        "UPDATE forum_categories SET name = $1 WHERE id = $2",
        [cb](const drogon::orm::Result &) {
            cb(true, "");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        name, id);
}

void ForumService::deleteCategory(const DbClientPtr &db, int id,
                                   BoolCallback cb) {
    db->execSqlAsync(
        "DELETE FROM forum_categories WHERE id = $1",
        [cb](const drogon::orm::Result &) {
            cb(true, "");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        id);
}

// --- Forums ---

void ForumService::getForum(
    const DbClientPtr &db, int forumId, int tenantId,
    std::function<void(const std::optional<ForumWithThreadsDto> &)> cb) {

    // Scoped to the tenant when tenantId != 0
    db->execSqlAsync(
        "SELECT f.id, f.name, f.description, f.category_id, "
        "COALESCE(f.total_threads, 0) AS total_threads, "
        "COALESCE(f.total_posts, 0) AS total_posts "
        "FROM forums f WHERE f.id = $1 AND ($2::int = 0 OR EXISTS "
        "(SELECT 1 FROM forum_categories c WHERE c.id = f.category_id "
        "AND c.tenant_id = $2::int))",
        [this, db, forumId, cb](const drogon::orm::Result &result) {
            if (result.empty()) {
                cb(std::nullopt);
                return;
            }

            ForumWithThreadsDto dto;
            dto.forum = rowToForumDto(result[0]);

            db->execSqlAsync(
                std::string("SELECT ") + kThreadCols + kThreadFrom +
                    "WHERE t.forum_id = $1 "
                    "ORDER BY t.is_pinned DESC, last_post_at DESC",
                [this, dto, cb](const drogon::orm::Result &threadResult) mutable {
                    for (const auto &row : threadResult) {
                        dto.threads.push_back(rowToThreadDto(row));
                    }
                    cb(dto);
                },
                [cb](const drogon::orm::DrogonDbException &) {
                    cb(std::nullopt);
                },
                forumId);
        },
        [cb](const drogon::orm::DrogonDbException &) {
            cb(std::nullopt);
        },
        forumId, tenantId);
}

void ForumService::createForum(const DbClientPtr &db, int categoryId,
                                const std::string &name,
                                const std::string &description,
                                BoolCallback cb) {
    db->execSqlAsync(
        "INSERT INTO forums (name, description, category_id, total_threads, total_posts) "
        "VALUES ($1, $2, $3, 0, 0) RETURNING id",
        [cb](const drogon::orm::Result &) {
            cb(true, "");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        name, description, categoryId);
}

void ForumService::updateForum(const DbClientPtr &db, int id,
                                const std::string &name,
                                const std::string &description,
                                BoolCallback cb) {
    db->execSqlAsync(
        "UPDATE forums SET name = $1, description = $2 WHERE id = $3",
        [cb](const drogon::orm::Result &) {
            cb(true, "");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        name, description, id);
}

void ForumService::deleteForum(const DbClientPtr &db, int id,
                                BoolCallback cb) {
    db->execSqlAsync(
        "DELETE FROM forums WHERE id = $1",
        [cb](const drogon::orm::Result &) {
            cb(true, "");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        id);
}

// --- Threads ---

void ForumService::getThread(
    const DbClientPtr &db, int threadId, int tenantId,
    std::function<void(const std::optional<ForumThreadWithPostsDto> &)> cb) {

    // Fetch thread (scoped to the tenant when tenantId != 0)
    db->execSqlAsync(
        std::string("SELECT ") + kThreadCols + kThreadFrom +
            "WHERE t.id = $1 AND ($2::int = 0 OR EXISTS "
            "(SELECT 1 FROM forums tf JOIN forum_categories tc "
            "ON tc.id = tf.category_id WHERE tf.id = t.forum_id "
            "AND tc.tenant_id = $2::int))",
        [this, db, threadId, cb](const drogon::orm::Result &result) {
            if (result.empty()) {
                cb(std::nullopt);
                return;
            }

            // Increment view count only for a visible thread
            db->execSqlAsync(
                "UPDATE forum_threads "
                "SET view_count = COALESCE(view_count, 0) + 1 "
                "WHERE id = $1",
                [](const drogon::orm::Result &) {},
                [](const drogon::orm::DrogonDbException &) {},
                threadId);

            ForumThreadWithPostsDto dto;
            dto.thread = rowToThreadDto(result[0]);

            db->execSqlAsync(
                "SELECT p.id, p.title, p.content, p.created_at, "
                "p.user_id, u.username, p.thread_id, "
                "(SELECT COUNT(*) FROM forum_post_votes v "
                "WHERE v.post_id = p.id AND v.is_like)::int AS likes, "
                "(SELECT COUNT(*) FROM forum_post_votes v "
                "WHERE v.post_id = p.id AND NOT v.is_like)::int AS dislikes "
                "FROM forum_posts p "
                "LEFT JOIN users u ON u.id = p.user_id "
                "WHERE p.thread_id = $1 "
                "ORDER BY p.created_at ASC, p.id ASC",
                [this, dto, cb](const drogon::orm::Result &postResult) mutable {
                    for (const auto &row : postResult) {
                        auto post = rowToPostDto(row);
                        post.likes = row["likes"].as<int>();
                        post.dislikes = row["dislikes"].as<int>();
                        dto.posts.push_back(post);
                    }
                    cb(dto);
                },
                [cb](const drogon::orm::DrogonDbException &) {
                    cb(std::nullopt);
                },
                threadId);
        },
        [cb](const drogon::orm::DrogonDbException &) {
            cb(std::nullopt);
        },
        threadId, tenantId);
}

void ForumService::createThread(const DbClientPtr &db, int forumId,
                                 const std::string &title,
                                 const std::string &description,
                                 const std::string &content,
                                 int userId, int tenantId,
                                 IdCallback cb) {
    db->execSqlAsync(
        "INSERT INTO forum_threads (name, description, forum_id, user_id, "
        "view_count, total_posts, created_at) "
        "SELECT $1::text, $2::text, f.id, $4::int, 0, 1, NOW() "
        "FROM forums f WHERE f.id = $3::int AND ($5::int = 0 OR EXISTS "
        "(SELECT 1 FROM forum_categories c WHERE c.id = f.category_id "
        "AND c.tenant_id = $5::int)) RETURNING id",
        [db, title, content, userId, cb](const drogon::orm::Result &result) {
            if (result.empty()) {
                cb(0, "Forum not found");
                return;
            }
            int threadId = result[0]["id"].as<int>();

            // Create the first post
            db->execSqlAsync(
                "INSERT INTO forum_posts (title, content, thread_id, user_id, "
                "created_at) VALUES ($1, $2, $3, $4, NOW())",
                [db, threadId, cb](const drogon::orm::Result &) {
                    // Update forum thread/post counts
                    db->execSqlAsync(
                        "UPDATE forums SET total_threads = COALESCE(total_threads, 0) + 1, "
                        "total_posts = COALESCE(total_posts, 0) + 1 "
                        "WHERE id = (SELECT forum_id FROM forum_threads WHERE id = $1)",
                        [threadId, cb](const drogon::orm::Result &) {
                            cb(threadId, "");
                        },
                        [cb](const drogon::orm::DrogonDbException &e) {
                            cb(0, e.base().what());
                        },
                        threadId);
                },
                [cb](const drogon::orm::DrogonDbException &e) {
                    cb(0, e.base().what());
                },
                title, content, threadId, userId);
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(0, e.base().what());
        },
        title, description, forumId, userId, tenantId);
}

void ForumService::updateThread(const DbClientPtr &db, int id, int userId,
                                 const std::string &title,
                                 const std::string &description,
                                 BoolCallback cb) {
    db->execSqlAsync(
        std::string("UPDATE forum_threads SET name = $2, description = $3 "
                    "WHERE id = $4 AND ") + kOwnerOrMod,
        [cb](const drogon::orm::Result &result) {
            if (result.affectedRows() == 0) {
                cb(false, "Thread not found or not permitted");
                return;
            }
            cb(true, "");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        userId, title, description, id);
}

void ForumService::setThreadFlags(const DbClientPtr &db, int id, int userId,
                                   bool pinned, bool locked,
                                   BoolCallback cb) {
    db->execSqlAsync(
        "UPDATE forum_threads SET is_pinned = $2, is_locked = $3 "
        "WHERE id = $4 AND EXISTS "
        "(SELECT 1 FROM users mu WHERE mu.id = $1::int AND mu.role >= 2)",
        [cb](const drogon::orm::Result &result) {
            if (result.affectedRows() == 0) {
                cb(false, "Thread not found or not permitted");
                return;
            }
            cb(true, "");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        userId, pinned, locked, id);
}

void ForumService::deleteThread(const DbClientPtr &db, int id, int userId,
                                 BoolCallback cb) {
    // Permission check first
    db->execSqlAsync(
        std::string("SELECT id FROM forum_threads WHERE id = $2 AND ") +
            kOwnerOrMod,
        [db, id, cb](const drogon::orm::Result &check) {
            if (check.empty()) {
                cb(false, "Thread not found or not permitted");
                return;
            }
            // Update forum counts before deleting
            db->execSqlAsync(
                "UPDATE forums SET "
                "total_threads = GREATEST(COALESCE(total_threads, 0) - 1, 0), "
                "total_posts = GREATEST(COALESCE(total_posts, 0) - "
                "(SELECT COUNT(*) FROM forum_posts WHERE thread_id = $1), 0) "
                "WHERE id = (SELECT forum_id FROM forum_threads WHERE id = $1)",
                [db, id, cb](const drogon::orm::Result &) {
                    // Delete posts first, then thread
                    db->execSqlAsync(
                        "DELETE FROM forum_posts WHERE thread_id = $1",
                        [db, id, cb](const drogon::orm::Result &) {
                            db->execSqlAsync(
                                "DELETE FROM forum_threads WHERE id = $1",
                                [cb](const drogon::orm::Result &) {
                                    cb(true, "");
                                },
                                [cb](const drogon::orm::DrogonDbException &e) {
                                    cb(false, e.base().what());
                                },
                                id);
                        },
                        [cb](const drogon::orm::DrogonDbException &e) {
                            cb(false, e.base().what());
                        },
                        id);
                },
                [cb](const drogon::orm::DrogonDbException &e) {
                    cb(false, e.base().what());
                },
                id);
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        userId, id);
}

// --- Posts ---

void ForumService::createPost(const DbClientPtr &db, int threadId,
                               const std::string &title,
                               const std::string &content,
                               int userId,
                               IdCallback cb) {
    // Refuses locked or missing threads (no row inserted).
    db->execSqlAsync(
        "INSERT INTO forum_posts (title, content, thread_id, user_id, "
        "created_at) SELECT $1::text, $2::text, t.id, $4::int, NOW() "
        "FROM forum_threads t WHERE t.id = $3::int AND NOT t.is_locked "
        "RETURNING id",
        [db, threadId, cb](const drogon::orm::Result &inserted) {
            if (inserted.empty()) {
                cb(0, "Thread is locked or not found");
                return;
            }
            int postId = inserted[0]["id"].as<int>();
            // Update thread post count
            db->execSqlAsync(
                "UPDATE forum_threads SET total_posts = COALESCE(total_posts, 0) + 1 "
                "WHERE id = $1",
                [db, threadId, postId, cb](const drogon::orm::Result &) {
                    // Update forum post count
                    db->execSqlAsync(
                        "UPDATE forums SET total_posts = COALESCE(total_posts, 0) + 1 "
                        "WHERE id = (SELECT forum_id FROM forum_threads WHERE id = $1)",
                        [postId, cb](const drogon::orm::Result &) {
                            cb(postId, "");
                        },
                        [cb](const drogon::orm::DrogonDbException &e) {
                            cb(0, e.base().what());
                        },
                        threadId);
                },
                [cb](const drogon::orm::DrogonDbException &e) {
                    cb(0, e.base().what());
                },
                threadId);
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(0, e.base().what());
        },
        title, content, threadId, userId);
}

void ForumService::getPost(
    const DbClientPtr &db, int postId,
    std::function<void(const std::optional<ForumPostDto> &)> cb) {
    db->execSqlAsync(
        "SELECT p.id, p.title, p.content, p.created_at, "
        "p.user_id, u.username, p.thread_id "
        "FROM forum_posts p "
        "LEFT JOIN users u ON u.id = p.user_id "
        "WHERE p.id = $1",
        [this, cb](const drogon::orm::Result &result) {
            if (result.empty()) {
                cb(std::nullopt);
            } else {
                cb(rowToPostDto(result[0]));
            }
        },
        [cb](const drogon::orm::DrogonDbException &) {
            cb(std::nullopt);
        },
        postId);
}

void ForumService::updatePost(const DbClientPtr &db, int postId, int userId,
                               const std::string &title,
                               const std::string &content,
                               BoolCallback cb) {
    db->execSqlAsync(
        std::string("UPDATE forum_posts SET title = $2, content = $3 "
                    "WHERE id = $4 AND ") + kOwnerOrMod,
        [cb](const drogon::orm::Result &result) {
            if (result.affectedRows() == 0) {
                cb(false, "Post not found or not permitted");
                return;
            }
            cb(true, "");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        userId, title, content, postId);
}

void ForumService::deletePost(const DbClientPtr &db, int postId, int userId,
                               BoolCallback cb) {
    // Get thread_id before deleting (also checks permission)
    db->execSqlAsync(
        std::string("SELECT thread_id FROM forum_posts WHERE id = $2 AND ") +
            kOwnerOrMod,
        [db, postId, cb](const drogon::orm::Result &result) {
            if (result.empty()) {
                cb(false, "Post not found or not permitted");
                return;
            }
            int threadId = result[0]["thread_id"].as<int>();

            db->execSqlAsync(
                "DELETE FROM forum_posts WHERE id = $1",
                [db, threadId, cb](const drogon::orm::Result &) {
                    // Update thread post count
                    db->execSqlAsync(
                        "UPDATE forum_threads SET "
                        "total_posts = GREATEST(COALESCE(total_posts, 0) - 1, 0) "
                        "WHERE id = $1",
                        [db, threadId, cb](const drogon::orm::Result &) {
                            // Update forum post count
                            db->execSqlAsync(
                                "UPDATE forums SET "
                                "total_posts = GREATEST(COALESCE(total_posts, 0) - 1, 0) "
                                "WHERE id = (SELECT forum_id FROM forum_threads WHERE id = $1)",
                                [cb](const drogon::orm::Result &) {
                                    cb(true, "");
                                },
                                [cb](const drogon::orm::DrogonDbException &e) {
                                    cb(false, e.base().what());
                                },
                                threadId);
                        },
                        [cb](const drogon::orm::DrogonDbException &e) {
                            cb(false, e.base().what());
                        },
                        threadId);
                },
                [cb](const drogon::orm::DrogonDbException &e) {
                    cb(false, e.base().what());
                },
                postId);
        },
        [cb](const drogon::orm::DrogonDbException &) {
            cb(false, "Post not found");
        },
        userId, postId);
}

// --- Voting ---

void ForumService::votePost(const DbClientPtr &db, int postId, int userId,
                             bool isLike, BoolCallback cb) {
    db->execSqlAsync(
        "INSERT INTO forum_post_votes (post_id, user_id, is_like) "
        "VALUES ($1, $2, $3) "
        "ON CONFLICT (post_id, user_id) DO UPDATE SET is_like = $3",
        [cb](const drogon::orm::Result &) {
            cb(true, "");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        postId, userId, isLike);
}

} // namespace pyracms
