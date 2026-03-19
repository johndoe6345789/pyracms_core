#include "services/ArticleService.h"
#include "services/CacheService.h"
#include "services/ElasticsearchService.h"

namespace pyracms {

ArticleDto ArticleService::rowToArticleDto(const drogon::orm::Row &row) {
    ArticleDto dto;
    dto.id = row["id"].as<int>();
    dto.name = row["name"].as<std::string>();
    dto.displayName = row["display_name"].as<std::string>();
    dto.isPrivate = row["is_private"].as<bool>();
    dto.hideDisplayName = row["hide_display_name"].as<bool>();
    dto.userId = row["user_id"].as<int>();
    dto.rendererName = row["renderer_name"].isNull() ? "markdown" : row["renderer_name"].as<std::string>();
    dto.viewCount = row["view_count"].as<int>();
    dto.createdAt = row["created_at"].as<std::string>();
    dto.status = row["status"].isNull() ? "published" : row["status"].as<std::string>();
    dto.publishedAt = row["published_at"].isNull() ? "" : row["published_at"].as<std::string>();
    dto.scheduledAt = row["scheduled_at"].isNull() ? "" : row["scheduled_at"].as<std::string>();
    return dto;
}

ArticleRevisionDto ArticleService::rowToRevisionDto(const drogon::orm::Row &row) {
    ArticleRevisionDto dto;
    dto.id = row["id"].as<int>();
    dto.articleId = row["article_id"].as<int>();
    dto.content = row["content"].as<std::string>();
    dto.summary = row["summary"].isNull() ? "" : row["summary"].as<std::string>();
    dto.userId = row["user_id"].as<int>();
    dto.createdAt = row["created_at"].as<std::string>();
    return dto;
}

void ArticleService::listArticles(const DbClientPtr &db, int tenantId,
                                   int limit, int offset,
                                   ArticleListCallback cb) {
    db->execSqlAsync(
        "SELECT * FROM articles WHERE tenant_id = $1 AND is_private = false "
        "ORDER BY created_at DESC LIMIT " + std::to_string(limit) + " OFFSET " + std::to_string(offset),
        [this, cb](const drogon::orm::Result &result) {
            std::vector<ArticleDto> articles;
            articles.reserve(result.size());
            for (const auto &row : result) {
                articles.push_back(rowToArticleDto(row));
            }
            cb(articles);
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            LOG_ERROR << "listArticles error: " << e.base().what();
            cb({});
        },
        tenantId);
}

void ArticleService::getArticle(const DbClientPtr &db, int tenantId,
                                 const std::string &name,
                                 ArticleCallback cb) {
    // Increment view_count and return the article
    db->execSqlAsync(
        "UPDATE articles SET view_count = view_count + 1 "
        "WHERE tenant_id = $1 AND name = $2 "
        "RETURNING *",
        [this, cb](const drogon::orm::Result &result) {
            if (result.empty()) {
                cb(std::nullopt);
            } else {
                cb(rowToArticleDto(result[0]));
            }
        },
        [cb](const drogon::orm::DrogonDbException &) {
            cb(std::nullopt);
        },
        tenantId, name);
}

void ArticleService::createArticle(const DbClientPtr &db, int tenantId,
                                    const std::string &name,
                                    const std::string &displayName,
                                    const std::string &content,
                                    const std::string &renderer,
                                    int userId,
                                    BoolCallback cb) {
    db->execSqlAsync(
        "INSERT INTO articles (tenant_id, name, display_name, is_private, "
        "hide_display_name, user_id, renderer_name, view_count, created_at) "
        "VALUES ($1, $2, $3, false, false, $4, $5, 0, NOW()) "
        "RETURNING id",
        [this, db, tenantId, name, displayName, content, userId, cb](const drogon::orm::Result &result) {
            int articleId = result[0]["id"].as<int>();
            // Create the initial revision
            db->execSqlAsync(
                "INSERT INTO article_revisions (article_id, content, summary, "
                "user_id, created_at) "
                "VALUES ($1, $2, 'Initial revision', $3, NOW())",
                [tenantId, name, displayName, content, articleId, cb](const drogon::orm::Result &) {
                    // Invalidate cache
                    CacheService::instance().invalidateArticle(tenantId, name);
                    // Index in Elasticsearch
                    if (ElasticsearchService::instance().isConfigured()) {
                        ElasticsearchService::instance().indexArticle(
                            tenantId, articleId, name, displayName, content, "");
                    }
                    cb(true, "");
                },
                [cb](const drogon::orm::DrogonDbException &e) {
                    cb(false, e.base().what());
                },
                articleId, content, userId);
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        tenantId, name, displayName, userId, renderer);
}

void ArticleService::updateArticle(const DbClientPtr &db, int tenantId,
                                    const std::string &name,
                                    const std::string &content,
                                    const std::string &summary,
                                    int userId,
                                    BoolCallback cb) {
    // Find the article first, then create a new revision
    db->execSqlAsync(
        "SELECT id FROM articles WHERE tenant_id = $1 AND name = $2",
        [this, db, content, summary, userId, cb](const drogon::orm::Result &result) {
            if (result.empty()) {
                cb(false, "Article not found");
                return;
            }
            int articleId = result[0]["id"].as<int>();
            db->execSqlAsync(
                "INSERT INTO article_revisions (article_id, content, summary, "
                "user_id, created_at) "
                "VALUES ($1, $2, $3, $4, NOW())",
                [cb](const drogon::orm::Result &) {
                    cb(true, "");
                },
                [cb](const drogon::orm::DrogonDbException &e) {
                    cb(false, e.base().what());
                },
                articleId, content, summary, userId);
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        tenantId, name);
}

void ArticleService::deleteArticle(const DbClientPtr &db, int tenantId,
                                    const std::string &name,
                                    BoolCallback cb) {
    db->execSqlAsync(
        "DELETE FROM articles WHERE tenant_id = $1 AND name = $2 RETURNING id",
        [tenantId, name, cb](const drogon::orm::Result &result) {
            if (result.affectedRows() == 0) {
                cb(false, "Article not found");
            } else {
                CacheService::instance().invalidateArticle(tenantId, name);
                if (ElasticsearchService::instance().isConfigured()) {
                    ElasticsearchService::instance().deleteDocument(
                        "pyracms_articles", result[0]["id"].as<int>());
                }
                cb(true, "");
            }
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        tenantId, name);
}

void ArticleService::listRevisions(const DbClientPtr &db, int articleId,
                                    RevisionListCallback cb) {
    db->execSqlAsync(
        "SELECT * FROM article_revisions WHERE article_id = $1 "
        "ORDER BY created_at DESC",
        [this, cb](const drogon::orm::Result &result) {
            std::vector<ArticleRevisionDto> revisions;
            revisions.reserve(result.size());
            for (const auto &row : result) {
                revisions.push_back(rowToRevisionDto(row));
            }
            cb(revisions);
        },
        [cb](const drogon::orm::DrogonDbException &) {
            cb({});
        },
        articleId);
}

void ArticleService::getRevision(const DbClientPtr &db, int revisionId,
                                  RevisionCallback cb) {
    db->execSqlAsync(
        "SELECT * FROM article_revisions WHERE id = $1",
        [this, cb](const drogon::orm::Result &result) {
            if (result.empty()) {
                cb(std::nullopt);
            } else {
                cb(rowToRevisionDto(result[0]));
            }
        },
        [cb](const drogon::orm::DrogonDbException &) {
            cb(std::nullopt);
        },
        revisionId);
}

void ArticleService::revertToRevision(const DbClientPtr &db, int articleId,
                                       int revisionId, int userId,
                                       BoolCallback cb) {
    // Get the content from the target revision, then create a new revision
    db->execSqlAsync(
        "SELECT content FROM article_revisions WHERE id = $1 AND article_id = $2",
        [this, db, articleId, userId, revisionId, cb](const drogon::orm::Result &result) {
            if (result.empty()) {
                cb(false, "Revision not found");
                return;
            }
            auto content = result[0]["content"].as<std::string>();
            auto summary = "Reverted to revision " + std::to_string(revisionId);
            db->execSqlAsync(
                "INSERT INTO article_revisions (article_id, content, summary, "
                "user_id, created_at) "
                "VALUES ($1, $2, $3, $4, NOW())",
                [cb](const drogon::orm::Result &) {
                    cb(true, "");
                },
                [cb](const drogon::orm::DrogonDbException &e) {
                    cb(false, e.base().what());
                },
                articleId, content, summary, userId);
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        revisionId, articleId);
}

void ArticleService::switchRenderer(const DbClientPtr &db, int articleId,
                                     const std::string &renderer,
                                     BoolCallback cb) {
    db->execSqlAsync(
        "UPDATE articles SET renderer_name = $1 WHERE id = $2",
        [cb](const drogon::orm::Result &result) {
            if (result.affectedRows() == 0) {
                cb(false, "Article not found");
            } else {
                cb(true, "");
            }
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        renderer, articleId);
}

void ArticleService::togglePrivate(const DbClientPtr &db, int articleId,
                                    BoolCallback cb) {
    db->execSqlAsync(
        "UPDATE articles SET is_private = NOT is_private WHERE id = $1",
        [cb](const drogon::orm::Result &result) {
            if (result.affectedRows() == 0) {
                cb(false, "Article not found");
            } else {
                cb(true, "");
            }
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        articleId);
}

void ArticleService::voteArticle(const DbClientPtr &db, int articleId,
                                  int userId, bool isLike,
                                  BoolCallback cb) {
    db->execSqlAsync(
        "INSERT INTO article_votes (article_id, user_id, is_like, created_at) "
        "VALUES ($1, $2, $3, NOW()) "
        "ON CONFLICT (article_id, user_id) DO UPDATE SET is_like = $3",
        [cb](const drogon::orm::Result &) {
            cb(true, "");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        articleId, userId, isLike);
}

void ArticleService::setTags(const DbClientPtr &db, int articleId,
                              const std::vector<std::string> &tags,
                              BoolCallback cb) {
    // Delete existing tags, then insert new ones
    db->execSqlAsync(
        "DELETE FROM article_tags WHERE article_id = $1",
        [this, db, articleId, tags, cb](const drogon::orm::Result &) {
            if (tags.empty()) {
                cb(true, "");
                return;
            }

            // Build bulk insert
            std::string sql = "INSERT INTO article_tags (article_id, tag) VALUES ";
            std::vector<std::string> placeholders;
            int paramIdx = 1;
            for (size_t i = 0; i < tags.size(); ++i) {
                placeholders.push_back(
                    "($" + std::to_string(paramIdx++) + ", $" +
                    std::to_string(paramIdx++) + ")");
            }
            for (size_t i = 0; i < placeholders.size(); ++i) {
                if (i > 0) sql += ", ";
                sql += placeholders[i];
            }

            // Build params: alternating articleId and tag
            // Use a simpler approach with individual inserts for reliability
            // Re-do with a single batch approach using string params
            auto remaining = std::make_shared<int>(static_cast<int>(tags.size()));
            auto failed = std::make_shared<bool>(false);
            auto errorMsg = std::make_shared<std::string>();

            for (const auto &tag : tags) {
                db->execSqlAsync(
                    "INSERT INTO article_tags (article_id, tag) VALUES ($1, $2)",
                    [remaining, failed, cb](const drogon::orm::Result &) {
                        (*remaining)--;
                        if (*remaining == 0 && !*failed) {
                            cb(true, "");
                        }
                    },
                    [remaining, failed, errorMsg, cb](const drogon::orm::DrogonDbException &e) {
                        (*remaining)--;
                        if (!*failed) {
                            *failed = true;
                            *errorMsg = e.base().what();
                        }
                        if (*remaining == 0) {
                            cb(false, *errorMsg);
                        }
                    },
                    articleId, tag);
            }
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        articleId);
}

void ArticleService::publishArticle(const DbClientPtr &db, int articleId,
                                     BoolCallback cb) {
    db->execSqlAsync(
        "UPDATE articles SET status = 'published', published_at = NOW(), "
        "scheduled_at = NULL WHERE id = $1",
        [cb](const drogon::orm::Result &result) {
            if (result.affectedRows() == 0) {
                cb(false, "Article not found");
            } else {
                cb(true, "");
            }
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        articleId);
}

void ArticleService::scheduleArticle(const DbClientPtr &db, int articleId,
                                      const std::string &scheduledAt,
                                      BoolCallback cb) {
    db->execSqlAsync(
        "UPDATE articles SET status = 'scheduled', scheduled_at = $2 "
        "WHERE id = $1",
        [cb](const drogon::orm::Result &result) {
            if (result.affectedRows() == 0) {
                cb(false, "Article not found");
            } else {
                cb(true, "");
            }
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        articleId, scheduledAt);
}

void ArticleService::unpublishArticle(const DbClientPtr &db, int articleId,
                                       BoolCallback cb) {
    db->execSqlAsync(
        "UPDATE articles SET status = 'unpublished' WHERE id = $1",
        [cb](const drogon::orm::Result &result) {
            if (result.affectedRows() == 0) {
                cb(false, "Article not found");
            } else {
                cb(true, "");
            }
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        articleId);
}

void ArticleService::publishDueArticles(const DbClientPtr &db,
                                         BoolCallback cb) {
    db->execSqlAsync(
        "UPDATE articles SET status = 'published', published_at = NOW() "
        "WHERE status = 'scheduled' AND scheduled_at <= NOW()",
        [cb](const drogon::orm::Result &result) {
            cb(true, std::to_string(result.affectedRows()) + " articles published");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        });
}

void ArticleService::listArticlesByStatus(const DbClientPtr &db, int tenantId,
                                           const std::string &status,
                                           int limit, int offset,
                                           ArticleListCallback cb) {
    db->execSqlAsync(
        "SELECT * FROM articles WHERE tenant_id = $1 AND status = $2 "
        "ORDER BY created_at DESC LIMIT $3 OFFSET $4",
        [this, cb](const drogon::orm::Result &result) {
            std::vector<ArticleDto> articles;
            articles.reserve(result.size());
            for (const auto &row : result) {
                articles.push_back(rowToArticleDto(row));
            }
            cb(articles);
        },
        [cb](const drogon::orm::DrogonDbException &) {
            cb({});
        },
        tenantId, status, limit, offset);
}

} // namespace pyracms
