#include "controllers/WebhookController.h"

namespace pyracms {

void WebhookController::listWebhooks(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback) {

    auto tenantIdStr = req->getParameter("tenant_id");
    if (tenantIdStr.empty()) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "tenant_id is required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    int tenantId = std::stoi(tenantIdStr);
    auto db = drogon::app().getDbClient();

    webhookService_.listWebhooks(
        db, tenantId,
        [callback](const std::vector<WebhookDto> &webhooks) {
            Json::Value result(Json::arrayValue);
            for (const auto &w : webhooks) {
                Json::Value item;
                item["id"] = w.id;
                item["tenantId"] = w.tenantId;
                item["url"] = w.url;
                item["active"] = w.active;
                item["createdAt"] = w.createdAt;
                item["events"] = Json::Value(Json::arrayValue);
                for (const auto &e : w.events) {
                    item["events"].append(e);
                }
                result.append(item);
            }
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

void WebhookController::createWebhook(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback) {

    auto json = req->getJsonObject();
    if (!json || !(*json).isMember("url") || !(*json).isMember("events") ||
        !(*json).isMember("tenant_id")) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "url, events, and tenant_id required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    auto url = (*json)["url"].asString();
    auto secret = (*json).get("secret", "").asString();
    int tenantId = (*json)["tenant_id"].asInt();

    std::vector<std::string> events;
    for (const auto &e : (*json)["events"]) {
        events.push_back(e.asString());
    }

    auto db = drogon::app().getDbClient();

    webhookService_.createWebhook(
        db, tenantId, url, events, secret,
        [callback](bool success, int webhookId, const std::string &error) {
            if (!success) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = error;
                resp->setStatusCode(drogon::k500InternalServerError);
                callback(resp);
                return;
            }

            Json::Value result;
            result["message"] = "Webhook created";
            result["id"] = webhookId;
            auto resp = drogon::HttpResponse::newHttpJsonResponse(result);
            resp->setStatusCode(drogon::k201Created);
            callback(resp);
        });
}

void WebhookController::updateWebhook(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &id) {

    auto json = req->getJsonObject();
    if (!json) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "JSON body required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    int webhookId = std::stoi(id);
    auto url = (*json).get("url", "").asString();
    auto secret = (*json).get("secret", "").asString();
    bool active = (*json).get("active", true).asBool();

    std::vector<std::string> events;
    if ((*json).isMember("events")) {
        for (const auto &e : (*json)["events"]) {
            events.push_back(e.asString());
        }
    }

    auto db = drogon::app().getDbClient();

    webhookService_.updateWebhook(
        db, webhookId, url, events, secret, active,
        [callback](bool success, const std::string &error) {
            if (!success) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = error;
                resp->setStatusCode(drogon::k404NotFound);
                callback(resp);
                return;
            }

            Json::Value result;
            result["message"] = "Webhook updated";
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

void WebhookController::deleteWebhook(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &id) {

    int webhookId = std::stoi(id);
    auto db = drogon::app().getDbClient();

    webhookService_.deleteWebhook(
        db, webhookId,
        [callback](bool success, const std::string &error) {
            if (!success) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = error;
                resp->setStatusCode(drogon::k404NotFound);
                callback(resp);
                return;
            }

            Json::Value result;
            result["message"] = "Webhook deleted";
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

void WebhookController::getDeliveries(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &id) {

    int webhookId = std::stoi(id);
    int limit = 20;
    int offset = 0;
    auto limitStr = req->getParameter("limit");
    auto offsetStr = req->getParameter("offset");
    if (!limitStr.empty()) limit = std::stoi(limitStr);
    if (!offsetStr.empty()) offset = std::stoi(offsetStr);

    auto db = drogon::app().getDbClient();

    webhookService_.getDeliveries(
        db, webhookId, limit, offset,
        [callback](const std::vector<WebhookDeliveryDto> &deliveries) {
            Json::Value result(Json::arrayValue);
            for (const auto &d : deliveries) {
                Json::Value item;
                item["id"] = d.id;
                item["webhookId"] = d.webhookId;
                item["event"] = d.event;
                item["statusCode"] = d.statusCode;
                item["responseBody"] = d.responseBody;
                item["deliveredAt"] = d.deliveredAt;
                Json::CharReaderBuilder readerBuilder;
                Json::Value payloadJson;
                std::istringstream payloadStream(d.payload);
                std::string errors;
                if (Json::parseFromStream(readerBuilder, payloadStream, &payloadJson, &errors)) {
                    item["payload"] = payloadJson;
                } else {
                    item["payload"] = d.payload;
                }
                result.append(item);
            }
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

} // namespace pyracms
