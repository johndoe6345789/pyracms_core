#pragma once

#include <drogon/HttpController.h>
#include "services/WebhookService.h"

namespace pyracms {

class WebhookController : public drogon::HttpController<WebhookController> {
public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(WebhookController::listWebhooks, "/api/webhooks", drogon::Get, "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(WebhookController::createWebhook, "/api/webhooks", drogon::Post, "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(WebhookController::updateWebhook, "/api/webhooks/{id}", drogon::Put, "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(WebhookController::deleteWebhook, "/api/webhooks/{id}", drogon::Delete, "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(WebhookController::getDeliveries, "/api/webhooks/{id}/deliveries", drogon::Get, "pyracms::JwtAuthFilter");
    METHOD_LIST_END

    void listWebhooks(const drogon::HttpRequestPtr &req,
                      std::function<void(const drogon::HttpResponsePtr &)> &&callback);

    void createWebhook(const drogon::HttpRequestPtr &req,
                       std::function<void(const drogon::HttpResponsePtr &)> &&callback);

    void updateWebhook(const drogon::HttpRequestPtr &req,
                       std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                       const std::string &id);

    void deleteWebhook(const drogon::HttpRequestPtr &req,
                       std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                       const std::string &id);

    void getDeliveries(const drogon::HttpRequestPtr &req,
                       std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                       const std::string &id);

private:
    WebhookService webhookService_;
};

} // namespace pyracms
