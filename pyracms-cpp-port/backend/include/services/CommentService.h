#pragma once

#include <drogon/drogon.h>
#include <functional>
#include <optional>
#include <string>
#include <vector>

namespace pyracms {

struct CommentDto {
    int id;
    int userId;
    std::string username;
    std::string contentType;
    int contentId;
    int parentId;  // 0 if no parent
    std::string body;
    int likes;
    int dislikes;
    std::string createdAt;
    std::string updatedAt;
};

class CommentService {
public:
    using DbClientPtr = drogon::orm::DbClientPtr;
    using BoolCallback = std::function<void(bool success, const std::string &error)>;
    using ListCallback = std::function<void(const std::vector<CommentDto> &)>;
    using SingleCallback = std::function<void(const std::optional<CommentDto> &)>;
    using CreateCallback = std::function<void(bool success, int commentId, const std::string &error)>;

    void createComment(const DbClientPtr &db,
                       int userId,
                       const std::string &contentType,
                       int contentId,
                       const std::string &body,
                       std::optional<int> parentId,
                       CreateCallback cb);

    void getComments(const DbClientPtr &db,
                     const std::string &contentType,
                     int contentId,
                     int limit,
                     int offset,
                     ListCallback cb);

    void updateComment(const DbClientPtr &db,
                       int commentId,
                       int userId,
                       const std::string &body,
                       BoolCallback cb);

    void deleteComment(const DbClientPtr &db,
                       int commentId,
                       int userId,
                       BoolCallback cb);

    void voteComment(const DbClientPtr &db,
                     int commentId,
                     int userId,
                     bool isLike,
                     BoolCallback cb);

    void findById(const DbClientPtr &db,
                  int commentId,
                  SingleCallback cb);

private:
    CommentDto rowToDto(const drogon::orm::Row &row);
};

} // namespace pyracms
