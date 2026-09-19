#pragma once

#include "security/SsrfGuard.h"
#include "security/Validate.h"

#include <json/json.h>
#include <optional>
#include <string>
#include <vector>

namespace pyracms {

// Parsed and validated webhook fields; `problem` is "" when acceptable.
struct WebhookInput {
    std::string problem;
    std::string url;    // "" = not sent
    std::string secret; // "" = not sent
    std::optional<std::vector<std::string>> events;
    std::optional<bool> active;
};

// `requireAll` (create): url and events must be present.
inline WebhookInput parseWebhookInput(const Json::Value &j, bool requireAll) {
    WebhookInput in;
    if (!j.isObject()) {
        in.problem = "JSON body required";
        return in;
    }
    if (j.isMember("url")) {
        if (!j["url"].isString()) {
            in.problem = "url must be text";
            return in;
        }
        in.url = j["url"].asString();
        in.problem = checkOutboundUrl(in.url);
        if (!in.problem.empty())
            return in;
    } else if (requireAll) {
        in.problem = "url, events, and tenant_id required";
        return in;
    }
    if (j.isMember("secret")) {
        if (!j["secret"].isString() || j["secret"].asString().size() > 128) {
            in.problem = "secret must be text of at most 128 characters";
            return in;
        }
        in.secret = j["secret"].asString();
    }
    if (j.isMember("events")) {
        if (!j["events"].isArray() || j["events"].size() > 20) {
            in.problem = "events must be a list of at most 20 names";
            return in;
        }
        std::vector<std::string> ev;
        for (const auto &e : j["events"]) {
            if (!e.isString() || !isSafeKey(e.asString(), 64)) {
                in.problem = "Invalid event name";
                return in;
            }
            ev.push_back(e.asString());
        }
        in.events = ev;
    } else if (requireAll) {
        in.problem = "url, events, and tenant_id required";
        return in;
    }
    if (j.isMember("active")) {
        if (!j["active"].isBool()) {
            in.problem = "active must be true or false";
            return in;
        }
        in.active = j["active"].asBool();
    }
    return in;
}

} // namespace pyracms
