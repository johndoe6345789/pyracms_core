#pragma once

#include "services/CodeSnippetDtos.h"

#include <json/json.h>

namespace pyracms {

inline Json::Value snippetTagsJson(const CodeSnippetDto &s) {
    Json::Value tags(Json::arrayValue);
    for (const auto &t : s.tags)
        tags.append(t);
    return tags;
}

} // namespace pyracms
