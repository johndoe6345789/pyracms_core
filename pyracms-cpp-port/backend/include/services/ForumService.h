#pragma once

#include "services/ForumDtos.h"

#include <drogon/drogon.h>
#include <functional>
#include <optional>
#include <string>
#include <vector>

namespace pyracms {

class ForumService {
  public:
    using DbClientPtr = drogon::orm::DbClientPtr;
    using BoolCallback =
        std::function<void(bool success, const std::string &error)>;
    // id > 0 on success; id == 0 and error set on failure.
    using IdCallback = std::function<void(int id, const std::string &error)>;
    void listCategories(
        const DbClientPtr &db, int tenantId,
        std::function<void(const std::vector<ForumCategoryWithForumsDto> &)>
            cb);
    void createCategory(const DbClientPtr &db, int tenantId,
                        const std::string &name, BoolCallback cb);
    // scopeTenant: 0 = any tenant, else the row must belong to it.
    void updateCategory(const DbClientPtr &db, int id, const std::string &name,
                        int scopeTenant, BoolCallback cb);
    void deleteCategory(const DbClientPtr &db, int id, int scopeTenant,
                        BoolCallback cb);
    void getForum(
        const DbClientPtr &db, int forumId, int tenantId,
        std::function<void(const std::optional<ForumWithThreadsDto> &)> cb);
    void createForum(const DbClientPtr &db, int categoryId,
                     const std::string &name, const std::string &description,
                     int scopeTenant, BoolCallback cb);
    void updateForum(const DbClientPtr &db, int id, const std::string &name,
                     const std::string &description, int scopeTenant,
                     BoolCallback cb);
    void deleteForum(const DbClientPtr &db, int id, int scopeTenant,
                     BoolCallback cb);
    void getThread(
        const DbClientPtr &db, int threadId, int tenantId,
        std::function<void(const std::optional<ForumThreadWithPostsDto> &)> cb);
    void createThread(const DbClientPtr &db, int forumId,
                      const std::string &title, const std::string &description,
                      const std::string &content, int userId, int tenantId,
                      IdCallback cb);
    void updateThread(const DbClientPtr &db, int id, int userId,
                      const std::string &title, const std::string &description,
                      BoolCallback cb);
    void deleteThread(const DbClientPtr &db, int id, int userId,
                      BoolCallback cb);
    // Moderator only (role >= 2).
    void setThreadFlags(const DbClientPtr &db, int id, int userId, bool pinned,
                        bool locked, BoolCallback cb);
    void createPost(const DbClientPtr &db, int threadId,
                    const std::string &title, const std::string &content,
                    int userId, IdCallback cb);
    void getPost(const DbClientPtr &db, int postId,
                 std::function<void(const std::optional<ForumPostDto> &)> cb);
    void updatePost(const DbClientPtr &db, int postId, int userId,
                    const std::string &title, const std::string &content,
                    BoolCallback cb);
    void deletePost(const DbClientPtr &db, int postId, int userId,
                    BoolCallback cb);
    void votePost(const DbClientPtr &db, int postId, int userId, bool isLike,
                  BoolCallback cb);

  private:
    ForumDto rowToForumDto(const drogon::orm::Row &row);
    ForumThreadDto rowToThreadDto(const drogon::orm::Row &row);
    ForumPostDto rowToPostDto(const drogon::orm::Row &row);
};

} // namespace pyracms
