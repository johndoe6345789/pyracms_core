#pragma once

#include "SearchService.h"

#include <drogon/drogon.h>
#include <functional>
#include <map>
#include <string>
#include <vector>

namespace pyracms {

class ElasticsearchService {
  public:
    using DbClientPtr = drogon::orm::DbClientPtr;

    static ElasticsearchService &instance();

    void initialize();
    bool isConfigured() const;

    // Index management
    void createIndexes();

    // Indexing operations (called on content create/update/delete)
    void indexArticle(int tenantId, int articleId, const std::string &name,
                      const std::string &displayName,
                      const std::string &content, const std::string &createdAt);

    void deleteDocument(const std::string &index, int id);

    // Search operations
    void search(int tenantId, const std::string &query, const std::string &type,
                int limit, int offset,
                std::function<void(const SearchResults &)> cb);

    void
    autocomplete(int tenantId, const std::string &prefix, int limit,
                 std::function<void(const std::vector<AutocompleteItem> &)> cb);

  private:
    ElasticsearchService() = default;

    std::string esUrl_;
    bool configured_ = false;

    static size_t curlWriteCallback(char *ptr, size_t size, size_t nmemb,
                                    std::string *data);
    std::string httpRequest(const std::string &method, const std::string &path,
                            const std::string &body = "");
    Json::Value parseJson(const std::string &str);
};

} // namespace pyracms
