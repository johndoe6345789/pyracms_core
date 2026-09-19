#pragma once

#include "security/Validate.h"

#include <json/json.h>
#include <string>

namespace pyracms {

constexpr size_t kMaxSnippetBytes = 100000;

// "" when the snippet fields present in `j` are acceptable, else why not.
inline std::string snippetProblem(const Json::Value &j) {
    if (!j.isObject())
        return "JSON body required";
    for (const char *k : {"title", "code", "language", "visibility"}) {
        if (j.isMember(k) && !j[k].isString())
            return std::string(k) + " must be text";
    }
    if (j.isMember("title") && !isBoundedText(j["title"].asString(), 255))
        return "title is too long";
    if (j.isMember("code") &&
        !isBoundedText(j["code"].asString(), kMaxSnippetBytes))
        return "code is too large (100 KB limit)";
    if (j.isMember("language")) {
        auto l = j["language"].asString();
        if (l.empty() || l.size() > 50 ||
            l.find_first_not_of("abcdefghijklmnopqrstuvwxyz"
                                "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+#_-") !=
                std::string::npos)
            return "Invalid language";
    }
    if (j.isMember("visibility") && j["visibility"].asString() != "public" &&
        j["visibility"].asString() != "private")
        return "visibility must be public or private";
    return "";
}

} // namespace pyracms
