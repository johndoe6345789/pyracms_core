#pragma once

#include <json/json.h>
#include <string>

namespace pyracms {

// Fire-and-forget: tells the tenant's subscribed webhooks about an event.
// Never blocks or fails the request that caused it. Delivery goes through
// the SSRF guard in WebhookService.
void fireWebhookEvent(int tenantId, const std::string &event,
                      const Json::Value &data);

// Same, for a forum thread: the tenant is looked up from the thread's
// category so the event reaches the tenant that owns the forum.
void fireForumWebhookEvent(int threadId, const std::string &event,
                           Json::Value data);

// comment.created for a comment on `contentType`/`contentId`.
void fireCommentCreated(int tenantId, const std::string &contentType,
                        int contentId, int userId, int commentId);

} // namespace pyracms
