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

class ForumService {
public:
    using DbClientPtr = drogon::orm::DbClientPtr;
    using BoolCallback = std::function<void(bool success, const std::string &error)>;
    // id > 0 on success; id == 0 and error set on failure.
    using IdCallback = std::function<void(int id, const std::string &error)>;

    // Categories
    void listCategories(const DbClientPtr &db, int tenantId,
                        std::function<void(const std::vector<ForumCategoryWithForumsDto> &)> cb);

    void createCategory(const DbClientPtr &db, int tenantId,
                        const std::string &name,
                        BoolCallback cb);

    // scopeTenant: 0 = any tenant, else the row must belong to it.
    void updateCategory(const DbClientPtr &db, int id,
                        const std::string &name, int scopeTenant,
                        BoolCallback cb);

    void deleteCategory(const DbClientPtr &db, int id, int scopeTenant,
                        BoolCallback cb);

    // Forums
    void getForum(const DbClientPtr &db, int forumId, int tenantId,
                  std::function<void(const std::optional<ForumWithThreadsDto> &)> cb);

    void createForum(const DbClientPtr &db, int categoryId,
                     const std::string &name,
                     const std::string &description,
                     int scopeTenant, BoolCallback cb);

    void updateForum(const DbClientPtr &db, int id,
                     const std::string &name,
                     const std::string &description,
                     int scopeTenant, BoolCallback cb);

    void deleteForum(const DbClientPtr &db, int id, int scopeTenant,
                     BoolCallback cb);

    // Threads
    void getThread(const DbClientPtr &db, int threadId, int tenantId,
                   std::function<void(const std::optional<ForumThreadWithPostsDto> &)> cb);

    void createThread(const DbClientPtr &db, int forumId,
                      const std::string &title,
                      const std::string &description,
                      const std::string &content,
                      int userId, int tenantId,
                      IdCallback cb);

    void updateThread(const DbClientPtr &db, int id, int userId,
                      const std::string &title,
                      const std::string &description,
                      BoolCallback cb);

    void deleteThread(const DbClientPtr &db, int id, int userId,
                      BoolCallback cb);

    // Moderator only (role >= 2).
    void setThreadFlags(const DbClientPtr &db, int id, int userId,
                        bool pinned, bool locked, BoolCallback cb);

    // Posts
    void createPost(const DbClientPtr &db, int threadId,
                    const std::string &title,
                    const std::string &content,
                    int userId,
                    IdCallback cb);

    void getPost(const DbClientPtr &db, int postId,
                 std::function<void(const std::optional<ForumPostDto> &)> cb);

    void updatePost(const DbClientPtr &db, int postId, int userId,
                    const std::string &title,
                    const std::string &content,
                    BoolCallback cb);

    void deletePost(const DbClientPtr &db, int postId, int userId,
                    BoolCallback cb);

    // Voting
    void votePost(const DbClientPtr &db, int postId, int userId, bool isLike,
                  BoolCallback cb);

private:
    ForumCategoryDto rowToCategoryDto(const drogon::orm::Row &row);
    ForumDto rowToForumDto(const drogon::orm::Row &row);
    ForumThreadDto rowToThreadDto(const drogon::orm::Row &row);
    ForumPostDto rowToPostDto(const drogon::orm::Row &row);
};

} // namespace pyracms
