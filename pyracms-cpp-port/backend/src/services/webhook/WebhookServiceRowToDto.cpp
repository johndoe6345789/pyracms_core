#include "services/DbError.h"
#include "services/WebhookService.h"

#include <memory>
#include <sstream>

namespace pyracms {

WebhookDto WebhookService::rowToDto(const drogon::orm::Row &row) {
    WebhookDto dto;
    dto.id = row["id"].as<int>();
    dto.tenantId = row["tenant_id"].as<int>();
    dto.url = row["url"].as<std::string>();
    dto.secret = row["secret"].isNull() ? "" : row["secret"].as<std::string>();
    dto.active = row["active"].as<bool>();
    dto.createdAt = row["created_at"].as<std::string>();

    // Parse the PostgreSQL text array for events
    auto eventsStr = row["events"].as<std::string>();
    // PostgreSQL arrays come as {val1,val2,...}
    if (eventsStr.size() > 2) {
        eventsStr = eventsStr.substr(1, eventsStr.size() - 2); // strip { }
        std::istringstream stream(eventsStr);
        std::string event;
        while (std::getline(stream, event, ',')) {
            // Remove any quotes
            if (!event.empty() && event.front() == '"')
                event = event.substr(1);
            if (!event.empty() && event.back() == '"')
                event.pop_back();
            if (!event.empty())
                dto.events.push_back(event);
        }
    }

    return dto;
}

} // namespace pyracms
