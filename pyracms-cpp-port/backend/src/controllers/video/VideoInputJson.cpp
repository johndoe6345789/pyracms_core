#include "controllers/VideoJson.h"
#include "security/Validate.h"

namespace pyracms {

static bool readText(const Json::Value &body, const char *key,
                     std::string &out) {
    if (!body.isMember(key))
        return true;
    if (!body[key].isString())
        return false;
    out = body[key].asString();
    return true;
}

std::string applyVideoInput(const Json::Value &body, VideoInput &in) {
    if (!body.isObject())
        return "A JSON object is required";
    if (!readText(body, "title", in.title) || in.title.empty() ||
        !isBoundedText(in.title, 200))
        return "title must be 1 to 200 characters";
    if (!readText(body, "description", in.description) ||
        !isBoundedText(in.description, 5000))
        return "description must be at most 5000 characters";
    if (!readText(body, "visibility", in.visibility) ||
        (in.visibility != "public" && in.visibility != "unlisted" &&
         in.visibility != "private"))
        return "visibility must be public, unlisted or private";
    if (!readText(body, "thumbnailUuid", in.thumbnailUuid) ||
        (!in.thumbnailUuid.empty() && !isValidUuid(in.thumbnailUuid)))
        return "thumbnailUuid must be an uploaded file";
    if (body.isMember("durationSeconds")) {
        const auto &d = body["durationSeconds"];
        if (!d.isNumeric() || d.asDouble() < 0 || d.asDouble() > 604800)
            return "durationSeconds must be 0 to 604800";
        in.durationSeconds = static_cast<int>(d.asDouble() + 0.5);
    }
    return "";
}

} // namespace pyracms
