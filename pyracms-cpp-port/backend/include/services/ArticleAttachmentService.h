#pragma once

#include <drogon/drogon.h>
#include <functional>
#include <string>
#include <vector>

namespace pyracms {

struct ArticleAttachmentDto {
    int id;
    std::string fileUuid, filename, mimetype;
    int64_t size;
};

// Files attached to an article. Callers have already checked who may see
// or change the article (OwnerFilter / ArticleService::getArticle).
class ArticleAttachmentService {
  public:
    using DbClientPtr = drogon::orm::DbClientPtr;
    using BoolCallback =
        std::function<void(bool success, const std::string &error)>;
    void list(const DbClientPtr &db, int articleId,
              std::function<void(const std::vector<ArticleAttachmentDto> &)>
                  cb);
    void add(const DbClientPtr &db, int tenantId, const std::string &name,
             const std::string &fileUuid, BoolCallback cb);
    void remove(const DbClientPtr &db, int tenantId, const std::string &name,
                int attachmentId, BoolCallback cb);
};

} // namespace pyracms
