#pragma once

#include <drogon/HttpController.h>
#include "services/MenuService.h"

namespace pyracms {

class MenuController : public drogon::HttpController<MenuController> {
public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(MenuController::listGroups, "/api/menu-groups", drogon::Get);
    ADD_METHOD_TO(MenuController::createGroup, "/api/menu-groups", drogon::Post, "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(MenuController::deleteGroup, "/api/menu-groups/{id}", drogon::Delete, "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(MenuController::listItems, "/api/menu-groups/{id}/items", drogon::Get);
    ADD_METHOD_TO(MenuController::createItem, "/api/menu-groups/{id}/items", drogon::Post, "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(MenuController::updateItem, "/api/menus/{id}", drogon::Put, "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(MenuController::deleteItem, "/api/menus/{id}", drogon::Delete, "pyracms::JwtAuthFilter");
    METHOD_LIST_END

    void listGroups(const drogon::HttpRequestPtr &req,
                    std::function<void(const drogon::HttpResponsePtr &)> &&callback);

    void createGroup(const drogon::HttpRequestPtr &req,
                     std::function<void(const drogon::HttpResponsePtr &)> &&callback);

    void deleteGroup(const drogon::HttpRequestPtr &req,
                     std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                     int id);

    void listItems(const drogon::HttpRequestPtr &req,
                   std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                   int id);

    void createItem(const drogon::HttpRequestPtr &req,
                    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                    int id);

    void updateItem(const drogon::HttpRequestPtr &req,
                    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                    int id);

    void deleteItem(const drogon::HttpRequestPtr &req,
                    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                    int id);

private:
    MenuService menuService_;
};

} // namespace pyracms
