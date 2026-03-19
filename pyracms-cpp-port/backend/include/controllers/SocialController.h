#pragma once

#include <drogon/HttpController.h>
#include "services/SocialService.h"

namespace pyracms {

class SocialController : public drogon::HttpController<SocialController> {
public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(SocialController::follow, "/api/users/{id}/follow", drogon::Post, "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(SocialController::unfollow, "/api/users/{id}/follow", drogon::Delete, "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(SocialController::getFollowers, "/api/users/{id}/followers", drogon::Get);
    ADD_METHOD_TO(SocialController::getFollowing, "/api/users/{id}/following", drogon::Get);
    ADD_METHOD_TO(SocialController::getActivity, "/api/users/{id}/activity", drogon::Get);
    ADD_METHOD_TO(SocialController::getAchievements, "/api/users/{id}/achievements", drogon::Get);
    ADD_METHOD_TO(SocialController::getReputation, "/api/users/{id}/reputation", drogon::Get);
    METHOD_LIST_END

    void follow(const drogon::HttpRequestPtr &req,
                std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                const std::string &id);

    void unfollow(const drogon::HttpRequestPtr &req,
                  std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                  const std::string &id);

    void getFollowers(const drogon::HttpRequestPtr &req,
                      std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                      const std::string &id);

    void getFollowing(const drogon::HttpRequestPtr &req,
                      std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                      const std::string &id);

    void getActivity(const drogon::HttpRequestPtr &req,
                     std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                     const std::string &id);

    void getAchievements(const drogon::HttpRequestPtr &req,
                         std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                         const std::string &id);

    void getReputation(const drogon::HttpRequestPtr &req,
                       std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                       const std::string &id);

private:
    SocialService socialService_;
};

} // namespace pyracms
