#pragma once

#include "services/ArticleDtos.h"

#include <drogon/drogon.h>
#include <functional>
#include <optional>
#include <string>
#include <vector>

namespace pyracms {

class ArticleService {
  public:
    using DbClientPtr = drogon::orm::DbClientPtr;
    using ArticleCallback =
        std::function<void(const std::optional<ArticleDto> &)>;
    using ArticleListCallback =
        std::function<void(const std::vector<ArticleDto> &)>;
    using RevisionCallback =
        std::function<void(const std::optional<ArticleRevisionDto> &)>;
    using RevisionListCallback =
        std::function<void(const std::vector<ArticleRevisionDto> &)>;
    using BoolCallback =
        std::function<void(bool success, const std::string &error)>;
    // viewerId 0 = anonymous. Private/unpublished articles only show for
    // their author, moderators and the site owner. A non-empty `tag` keeps
    // only articles carrying that tag (case-insensitive).
    void listArticles(const DbClientPtr &db, int tenantId, int limit,
                      int offset, int viewerId, const std::string &tag,
                      ArticleListCallback cb);
    void getArticle(const DbClientPtr &db, int tenantId,
                    const std::string &name, int viewerId, ArticleCallback cb);
    // No visibility check, no view count: for callers past OwnerFilter.
    void findArticle(const DbClientPtr &db, int tenantId,
                     const std::string &name, ArticleCallback cb);
    void createArticle(const DbClientPtr &db, int tenantId,
                       const std::string &name, const std::string &displayName,
                       const std::string &content, const std::string &renderer,
                       int userId, BoolCallback cb);
    void updateArticle(const DbClientPtr &db, int tenantId,
                       const std::string &name, const std::string &content,
                       const std::string &summary, int userId, BoolCallback cb);
    void deleteArticle(const DbClientPtr &db, int tenantId,
                       const std::string &name, BoolCallback cb);
    void listRevisions(const DbClientPtr &db, int articleId,
                       RevisionListCallback cb);
    void getRevision(const DbClientPtr &db, int articleId, int revisionId,
                     RevisionCallback cb);
    void revertToRevision(const DbClientPtr &db, int articleId, int revisionId,
                          int userId, BoolCallback cb);
    void switchRenderer(const DbClientPtr &db, int articleId,
                        const std::string &renderer, BoolCallback cb);
    void togglePrivate(const DbClientPtr &db, int articleId, BoolCallback cb);
    void voteArticle(const DbClientPtr &db, int articleId, int userId,
                     bool isLike, BoolCallback cb);
    void setTags(const DbClientPtr &db, int articleId,
                 const std::vector<std::string> &tags, BoolCallback cb);
    using TagListCallback =
        std::function<void(const std::vector<std::string> &)>;
    void listTags(const DbClientPtr &db, int articleId, TagListCallback cb);
    void publishArticle(const DbClientPtr &db, int articleId, BoolCallback cb);
    void scheduleArticle(const DbClientPtr &db, int articleId,
                         const std::string &scheduledAt, BoolCallback cb);
    void unpublishArticle(const DbClientPtr &db, int articleId,
                          BoolCallback cb);
    void publishDueArticles(const DbClientPtr &db, BoolCallback cb);
    // Re-index (or drop) the article in the search engine after a change.
    void refreshSearchIndex(const DbClientPtr &db, int articleId);

  private:
    ArticleDto rowToArticleDto(const drogon::orm::Row &row);
    ArticleRevisionDto rowToRevisionDto(const drogon::orm::Row &row);
};

} // namespace pyracms
