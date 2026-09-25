#pragma once

#include <drogon/drogon.h>
#include <functional>
#include <string>
#include <vector>

namespace pyracms {

struct TagCount {
    std::string name;
    int articles;
    int snippets;
};

// Tags that span content types: a site's tag cloud, and snippet tagging.
class TagService {
  public:
    using DbClientPtr = drogon::orm::DbClientPtr;
    using BoolCallback =
        std::function<void(bool success, const std::string &error)>;
    // Author only; replaces the snippet's tags with `tags` (already
    // normalised). Not yours, or no such snippet, is a failure.
    void setSnippetTags(const DbClientPtr &db, int snippetId, int userId,
                        const std::vector<std::string> &tags, BoolCallback cb);
    // Public, published content only; most used first.
    void cloud(const DbClientPtr &db, int tenantId, int limit,
               std::function<void(const std::vector<TagCount> &)> cb);
};

} // namespace pyracms
