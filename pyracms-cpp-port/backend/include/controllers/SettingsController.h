#pragma once

#include <drogon/HttpController.h>
#include "services/SettingsService.h"

namespace pyracms {

class SettingsController : public drogon::HttpController<SettingsController> {
public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(SettingsController::list, "/api/settings", drogon::Get);
    ADD_METHOD_TO(SettingsController::getByName, "/api/settings/{name}", drogon::Get);
    ADD_METHOD_TO(SettingsController::createOrUpdate, "/api/settings/{name}", drogon::Put, "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(SettingsController::remove, "/api/settings/{name}", drogon::Delete, "pyracms::JwtAuthFilter");
    METHOD_LIST_END

    void list(const drogon::HttpRequestPtr &req,
              std::function<void(const drogon::HttpResponsePtr &)> &&callback);

    void getByName(const drogon::HttpRequestPtr &req,
                   std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                   const std::string &name);

    void createOrUpdate(const drogon::HttpRequestPtr &req,
                        std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                        const std::string &name);

    void remove(const drogon::HttpRequestPtr &req,
                std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                const std::string &name);

private:
    SettingsService settingsService_;
};

} // namespace pyracms
