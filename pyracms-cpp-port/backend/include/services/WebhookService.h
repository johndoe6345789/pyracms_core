#pragma once

#include <drogon/drogon.h>
#include <functional>
#include <optional>
#include <string>
#include <vector>

namespace pyracms {

struct WebhookDto {
    int id;
    int tenantId;
    std::string url;
    std::vector<std::string> events;
    std::string secret;
    bool active;
    std::string createdAt;
};

struct WebhookDeliveryDto {
    int id;
    int webhookId;
    std::string event;
    std::string payload;
    int statusCode;
    std::string responseBody;
    std::string deliveredAt;
};

class WebhookService {
  public:
    using DbClientPtr = drogon::orm::DbClientPtr;
    using BoolCallback =
        std::function<void(bool success, const std::string &error)>;
    void listWebhooks(const DbClientPtr &db, int tenantId,
                      std::function<void(const std::vector<WebhookDto> &)> cb);
    void createWebhook(const DbClientPtr &db, int tenantId,
                       const std::string &url,
                       const std::vector<std::string> &events,
                       const std::string &secret,
                       std::function<void(bool success, int webhookId,
                                          const std::string &error)>
                           cb);
    void updateWebhook(const DbClientPtr &db, int webhookId,
                       const std::string &url,
                       const std::optional<std::vector<std::string>> &events,
                       const std::string &secret,
                       const std::optional<bool> &active, BoolCallback cb);
    void deleteWebhook(const DbClientPtr &db, int webhookId, BoolCallback cb);
    void getDeliveries(
        const DbClientPtr &db, int webhookId, int limit, int offset,
        std::function<void(const std::vector<WebhookDeliveryDto> &)> cb);
    void fireEvent(const DbClientPtr &db, int tenantId,
                   const std::string &event, const Json::Value &data);
    // PostgreSQL text[] literal of pre-validated event names.
    static std::string eventsLiteral(const std::vector<std::string> &events);
    // Longest response body kept in the delivery log.
    static constexpr size_t kMaxLoggedBody = 1024;

  private:
    void sendWebhook(const WebhookDto &webhook, const std::string &event,
                     const Json::Value &payload, const std::string &payloadStr,
                     const DbClientPtr &db, int retryCount);
    void deliverWebhook(const WebhookDto &webhook, const std::string &event,
                        const Json::Value &payload, const DbClientPtr &db,
                        int retryCount = 0);
    std::string computeHmac(const std::string &payload,
                            const std::string &secret);
    WebhookDto rowToDto(const drogon::orm::Row &row);
};

} // namespace pyracms
