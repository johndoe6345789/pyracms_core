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
    std::string authorUsername;
    std::string rendererName;
    int viewCount;
    std::string createdAt;
    std::string status; // draft, scheduled, published, unpublished
    std::string publishedAt;
    std::string scheduledAt;
};

struct ArticleRevisionDto {
    int id;
    int articleId;
    std::string content;
    std::string summary;
    int userId;
    std::string authorUsername;
    std::string createdAt;
};

} // namespace pyracms
