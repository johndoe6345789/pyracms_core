#include "services/ForumService.h"

namespace pyracms {

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
    dto.viewCount = row["view_count"].isNull() ? 0 : row["view_count"].as<int>();
    dto.totalPosts = row["total_posts"].isNull() ? 0 : row["total_posts"].as<int>();
    dto.createdAt = row["created_at"].as<std::string>();
    return dto;
}

ForumPostDto ForumService::rowToPostDto(const drogon::orm::Row &row) {
    ForumPostDto dto;
    dto.id = row["id"].as<int>();
    dto.title = row["title"].isNull() ? "" : row["title"].as<std::string>();
    dto.content = row["content"].as<std::string>();
    dto.createdAt = row["created_at"].as<std::string>();
    dto.userId = row["user_id"].as<int>();
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
    const DbClientPtr &db, int forumId,
    std::function<void(const std::optional<ForumWithThreadsDto> &)> cb) {

    db->execSqlAsync(
        "SELECT id, name, description, category_id, "
        "COALESCE(total_threads, 0) AS total_threads, "
        "COALESCE(total_posts, 0) AS total_posts "
        "FROM forums WHERE id = $1",
        [this, db, forumId, cb](const drogon::orm::Result &result) {
            if (result.empty()) {
                cb(std::nullopt);
                return;
            }

            ForumWithThreadsDto dto;
            dto.forum = rowToForumDto(result[0]);

            db->execSqlAsync(
                "SELECT t.id, t.name, t.description, t.forum_id, "
                "COALESCE(t.view_count, 0) AS view_count, "
                "COALESCE(t.total_posts, 0) AS total_posts, "
                "t.created_at "
                "FROM forum_threads t WHERE t.forum_id = $1 "
                "ORDER BY t.created_at DESC",
                [dto, cb](const drogon::orm::Result &threadResult) mutable {
                    for (const auto &row : threadResult) {
                        ForumThreadDto thread;
                        thread.id = row["id"].as<int>();
                        thread.name = row["name"].as<std::string>();
                        thread.description = row["description"].isNull()
                                                 ? ""
                                                 : row["description"].as<std::string>();
                        thread.forumId = row["forum_id"].as<int>();
                        thread.viewCount = row["view_count"].as<int>();
                        thread.totalPosts = row["total_posts"].as<int>();
                        thread.createdAt = row["created_at"].as<std::string>();
                        dto.threads.push_back(thread);
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
        forumId);
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
    const DbClientPtr &db, int threadId,
    std::function<void(const std::optional<ForumThreadWithPostsDto> &)> cb) {

    // Increment view count
    db->execSqlAsync(
        "UPDATE forum_threads SET view_count = COALESCE(view_count, 0) + 1 "
        "WHERE id = $1",
        [](const drogon::orm::Result &) {},
        [](const drogon::orm::DrogonDbException &) {},
        threadId);

    // Fetch thread
    db->execSqlAsync(
        "SELECT id, name, description, forum_id, "
        "COALESCE(view_count, 0) AS view_count, "
        "COALESCE(total_posts, 0) AS total_posts, "
        "created_at "
        "FROM forum_threads WHERE id = $1",
        [this, db, threadId, cb](const drogon::orm::Result &result) {
            if (result.empty()) {
                cb(std::nullopt);
                return;
            }

            ForumThreadWithPostsDto dto;
            dto.thread = rowToThreadDto(result[0]);

            db->execSqlAsync(
                "SELECT p.id, p.title, p.content, p.created_at, "
                "p.user_id, u.username, p.thread_id "
                "FROM forum_posts p "
                "LEFT JOIN users u ON u.id = p.user_id "
                "WHERE p.thread_id = $1 "
                "ORDER BY p.created_at ASC",
                [dto, cb](const drogon::orm::Result &postResult) mutable {
                    for (const auto &row : postResult) {
                        ForumPostDto post;
                        post.id = row["id"].as<int>();
                        post.title = row["title"].isNull()
                                         ? ""
                                         : row["title"].as<std::string>();
                        post.content = row["content"].as<std::string>();
                        post.createdAt = row["created_at"].as<std::string>();
                        post.userId = row["user_id"].as<int>();
                        post.username = row["username"].isNull()
                                            ? ""
                                            : row["username"].as<std::string>();
                        post.threadId = row["thread_id"].as<int>();
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
        threadId);
}

void ForumService::createThread(const DbClientPtr &db, int forumId,
                                 const std::string &title,
                                 const std::string &description,
                                 const std::string &content,
                                 int userId,
                                 BoolCallback cb) {
    db->execSqlAsync(
        "INSERT INTO forum_threads (name, description, forum_id, view_count, "
        "total_posts, created_at) "
        "VALUES ($1, $2, $3, 0, 1, NOW()) RETURNING id",
        [db, title, content, userId, cb](const drogon::orm::Result &result) {
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
                title, content, threadId, userId);
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        title, description, forumId);
}

void ForumService::updateThread(const DbClientPtr &db, int id,
                                 const std::string &title,
                                 const std::string &description,
                                 BoolCallback cb) {
    db->execSqlAsync(
        "UPDATE forum_threads SET name = $1, description = $2 WHERE id = $3",
        [cb](const drogon::orm::Result &) {
            cb(true, "");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        title, description, id);
}

void ForumService::deleteThread(const DbClientPtr &db, int id,
                                 BoolCallback cb) {
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
}

// --- Posts ---

void ForumService::createPost(const DbClientPtr &db, int threadId,
                               const std::string &title,
                               const std::string &content,
                               int userId,
                               BoolCallback cb) {
    db->execSqlAsync(
        "INSERT INTO forum_posts (title, content, thread_id, user_id, "
        "created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id",
        [db, threadId, cb](const drogon::orm::Result &) {
            // Update thread post count
            db->execSqlAsync(
                "UPDATE forum_threads SET total_posts = COALESCE(total_posts, 0) + 1 "
                "WHERE id = $1",
                [db, threadId, cb](const drogon::orm::Result &) {
                    // Update forum post count
                    db->execSqlAsync(
                        "UPDATE forums SET total_posts = COALESCE(total_posts, 0) + 1 "
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

void ForumService::updatePost(const DbClientPtr &db, int postId,
                               const std::string &title,
                               const std::string &content,
                               BoolCallback cb) {
    db->execSqlAsync(
        "UPDATE forum_posts SET title = $1, content = $2 WHERE id = $3",
        [cb](const drogon::orm::Result &) {
            cb(true, "");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        title, content, postId);
}

void ForumService::deletePost(const DbClientPtr &db, int postId,
                               BoolCallback cb) {
    // Get thread_id before deleting
    db->execSqlAsync(
        "SELECT thread_id FROM forum_posts WHERE id = $1",
        [db, postId, cb](const drogon::orm::Result &result) {
            if (result.empty()) {
                cb(false, "Post not found");
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
        postId);
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
