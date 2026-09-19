#include "controllers/CommentController.h"
#include "security/Validate.h"

namespace pyracms {

void CommentController::getComments(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &contentType, int contentId) {

    auto db = drogon::app().getDbClient();

    int limit = 50;
    int offset = 0;
    try {
        auto limitParam = req->getParameter("limit");
        if (!limitParam.empty())
            limit = std::stoi(limitParam);
        auto offsetParam = req->getParameter("offset");
        if (!offsetParam.empty())
            offset = std::stoi(offsetParam);
    } catch (...) {
        // Use defaults
    }

    if (limit > 200)
        limit = 200;
    if (limit < 1)
        limit = 1;
    if (offset < 0)
        offset = 0;

    commentService_.getComments(
        db, contentType, contentId, limit, offset,
        [callback](const std::vector<CommentDto> &comments) {
            Json::Value result(Json::arrayValue);
            for (const auto &c : comments) {
                Json::Value item;
                item["id"] = c.id;
                item["userId"] = c.userId;
                item["username"] = c.username;
                item["contentType"] = c.contentType;
                item["contentId"] = c.contentId;
                item["parentId"] = c.parentId;
                item["body"] = c.body;
                item["likes"] = c.likes;
                item["dislikes"] = c.dislikes;
                item["createdAt"] = c.createdAt;
                item["updatedAt"] = c.updatedAt;
                result.append(item);
            }
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

} // namespace pyracms
