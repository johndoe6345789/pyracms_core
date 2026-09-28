#pragma once

#include <string>

namespace pyracms {

struct VideoDto {
    int id{0};
    int tenantId{0};
    int userId{0};
    std::string username;
    std::string title;
    std::string description;
    std::string fileUuid;
    std::string thumbnailUuid; // "" = none
    int durationSeconds{0};
    long long viewCount{0};
    int likes{0};
    int dislikes{0};
    std::string visibility; // public | unlisted | private
    std::string createdAt;
    std::string myVote; // like | dislike | "" (detail only)
};

// What a caller may set on create/update, already validated.
struct VideoInput {
    std::string title;
    std::string description;
    std::string thumbnailUuid;
    int durationSeconds{0};
    std::string visibility{"public"};
};

// Filters for the video list.
struct VideoQuery {
    int tenantId{0};
    int userId{0};   // 0 = every uploader
    int viewerId{0}; // sees own non-public videos when userId == viewerId
    std::string text;
    bool popular{false};
    int limit{24};
    int offset{0};
};

} // namespace pyracms
