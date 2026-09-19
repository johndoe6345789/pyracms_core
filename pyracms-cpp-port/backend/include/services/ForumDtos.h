#pragma once

#include <drogon/drogon.h>
#include <functional>
#include <optional>
#include <string>
#include <vector>

namespace pyracms {

struct ForumCategoryDto {
    int id;
    std::string name;
};

struct ForumDto {
    int id;
    std::string name;
    std::string description;
    int categoryId;
    int totalThreads;
    int totalPosts;
};

struct ForumThreadDto {
    int id;
    std::string name;
    std::string description;
    int forumId;
    int viewCount;
    int totalPosts;
    std::string createdAt;
    int userId = 0;
    std::string authorUsername;
    std::string lastPostAt;
    std::string forumName;
    bool pinned = false;
    bool locked = false;
};

struct ForumPostDto {
    int id;
    std::string title;
    std::string content;
    std::string createdAt;
    int userId;
    std::string username;
    int threadId;
    int likes = 0;
    int dislikes = 0;
};

struct ForumCategoryWithForumsDto {
    ForumCategoryDto category;
    std::vector<ForumDto> forums;
};

struct ForumWithThreadsDto {
    ForumDto forum;
    std::vector<ForumThreadDto> threads;
};

struct ForumThreadWithPostsDto {
    ForumThreadDto thread;
    std::vector<ForumPostDto> posts;
};

} // namespace pyracms
