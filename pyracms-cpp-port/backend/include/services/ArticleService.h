#pragma once

#include <drogon/drogon.h>
#include <functional>
#include <optional>
#include <string>
#include <vector>

namespace pyracms {

struct ArticleDto {
    int id;
    std::string name;
    std::string displayName;
    bool isPrivate;
    bool hideDisplayName;
    int userId;
    std::string rendererName;
    int viewCount;
    std::string createdAt;
    std::string status;       // draft, scheduled, published, unpublished
    std::string publishedAt;
    std::string scheduledAt;
};

struct ArticleRevisionDto {
    int id;
    int articleId;
    std::string content;
    std::string summary;
    int userId;
    std::string createdAt;
};

class ArticleService {
public:
    using DbClientPtr = drogon::orm::DbClientPtr;
    using ArticleCallback = std::function<void(const std::optional<ArticleDto> &)>;
    using ArticleListCallback = std::function<void(const std::vector<ArticleDto> &)>;
    using RevisionCallback = std::function<void(const std::optional<ArticleRevisionDto> &)>;
    using RevisionListCallback = std::function<void(const std::vector<ArticleRevisionDto> &)>;
    using BoolCallback = std::function<void(bool success, const std::string &error)>;

    void listArticles(const DbClientPtr &db, int tenantId,
                      int limit, int offset,
                      ArticleListCallback cb);

    void getArticle(const DbClientPtr &db, int tenantId,
                    const std::string &name,
                    ArticleCallback cb);

    void createArticle(const DbClientPtr &db, int tenantId,
                       const std::string &name,
                       const std::string &displayName,
                       const std::string &content,
                       const std::string &renderer,
                       int userId,
                       BoolCallback cb);

    void updateArticle(const DbClientPtr &db, int tenantId,
                       const std::string &name,
                       const std::string &content,
                       const std::string &summary,
                       int userId,
                       BoolCallback cb);

    void deleteArticle(const DbClientPtr &db, int tenantId,
                       const std::string &name,
                       BoolCallback cb);

    void listRevisions(const DbClientPtr &db, int articleId,
                       RevisionListCallback cb);

    void getRevision(const DbClientPtr &db, int revisionId,
                     RevisionCallback cb);

    void revertToRevision(const DbClientPtr &db, int articleId,
                          int revisionId, int userId,
                          BoolCallback cb);

    void switchRenderer(const DbClientPtr &db, int articleId,
                        const std::string &renderer,
                        BoolCallback cb);

    void togglePrivate(const DbClientPtr &db, int articleId,
                       BoolCallback cb);

    void voteArticle(const DbClientPtr &db, int articleId,
                     int userId, bool isLike,
                     BoolCallback cb);

    void setTags(const DbClientPtr &db, int articleId,
                 const std::vector<std::string> &tags,
                 BoolCallback cb);

    void publishArticle(const DbClientPtr &db, int articleId,
                        BoolCallback cb);

    void scheduleArticle(const DbClientPtr &db, int articleId,
                         const std::string &scheduledAt,
                         BoolCallback cb);

    void unpublishArticle(const DbClientPtr &db, int articleId,
                          BoolCallback cb);

    void publishDueArticles(const DbClientPtr &db,
                            BoolCallback cb);

    void listArticlesByStatus(const DbClientPtr &db, int tenantId,
                              const std::string &status,
                              int limit, int offset,
                              ArticleListCallback cb);

private:
    ArticleDto rowToArticleDto(const drogon::orm::Row &row);
    ArticleRevisionDto rowToRevisionDto(const drogon::orm::Row &row);
};

} // namespace pyracms
