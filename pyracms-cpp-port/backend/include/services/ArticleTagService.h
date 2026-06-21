#pragma once

#include <drogon/drogon.h>
#include <functional>
#include <string>
#include <vector>

namespace pyracms {

struct ArticleTagCloudItem {
    std::string name;
    int count;
};

class ArticleTagService {
public:
    using DbClientPtr = drogon::orm::DbClientPtr;
    using TagCloudCallback =
        std::function<void(const std::vector<ArticleTagCloudItem> &)>;

    void listTagCloud(const DbClientPtr &db, int tenantId, TagCloudCallback cb);
};

} // namespace pyracms
