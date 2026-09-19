#include "services/DbError.h"
#include "services/WebhookService.h"

#include <memory>
#include <sstream>

namespace pyracms {

// Event names are validated (Validate.h isSafeKey) before they get here, so
// plain quoting is a well-formed PostgreSQL array literal.
std::string
WebhookService::eventsLiteral(const std::vector<std::string> &events) {
    std::string out = "{";
    for (size_t i = 0; i < events.size(); i++) {
        if (i > 0)
            out += ",";
        out += "\"" + events[i] + "\"";
    }
    return out + "}";
}

} // namespace pyracms
