#pragma once

#include <string>
#include <vector>

namespace pyracms {

constexpr size_t kMaxTagLength = 64;
constexpr size_t kMaxTagsPerItem = 30;

// Column for snippet queries aliased `s`: the snippet's tags as "a,b,c".
inline constexpr const char *kSnippetTagListSql =
    "COALESCE((SELECT string_agg(t.name, ',' ORDER BY t.name) "
    "FROM snippet_tags t WHERE t.snippet_id = s.id), '') AS tag_list";

// What may be stored as a tag: trimmed, lower-cased (ASCII), inner runs of
// whitespace turned into '-', blanks dropped, cut to kMaxTagLength,
// duplicates removed, at most kMaxTagsPerItem kept (in first-seen order).
std::vector<std::string> normalizeTags(const std::vector<std::string> &in);

// Newline-joined, for a single SQL parameter (string_to_array($n, E'\n')).
std::string joinTags(const std::vector<std::string> &tags);

// "a,b,c" (as built by the tag_list SQL column) back into tags.
std::vector<std::string> splitTagList(const std::string &list);

} // namespace pyracms
