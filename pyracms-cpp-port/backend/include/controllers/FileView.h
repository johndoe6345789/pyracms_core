#pragma once

#include <algorithm>
#include <map>
#include <string>

namespace pyracms {

// What a file may be shown as when opened in the browser (not downloaded),
// decided from its name: pictures, PDF, video/audio, and source or plain
// text (always as text/plain, so nothing in it can run). "" = download only.
// SVG and HTML are deliberately left out: they can carry script.
inline std::string viewMime(const std::string &filename) {
    static const std::map<std::string, std::string> known = {
        {"png", "image/png"},       {"jpg", "image/jpeg"},
        {"jpeg", "image/jpeg"},     {"gif", "image/gif"},
        {"webp", "image/webp"},     {"pdf", "application/pdf"},
        {"mp4", "video/mp4"},       {"webm", "video/webm"},
        {"mp3", "audio/mpeg"},      {"ogg", "audio/ogg"},
        {"wav", "audio/wav"},       {"json", "application/json"},
    };
    static const char *text[] = {
        "txt", "md",  "rst", "csv", "log", "py",  "c",   "h",   "cpp", "hpp",
        "cc",  "js",  "ts",  "tsx", "jsx", "css", "xml", "yml", "yaml",
        "sh",  "bat", "ini", "cfg", "toml", "sql", "java", "go", "rs", "rb"};
    auto dot = filename.rfind('.');
    if (dot == std::string::npos)
        return "";
    auto ext = filename.substr(dot + 1);
    std::transform(ext.begin(), ext.end(), ext.begin(), ::tolower);
    auto it = known.find(ext);
    if (it != known.end())
        return it->second;
    for (const char *t : text)
        if (ext == t)
            return "text/plain; charset=utf-8";
    return "";
}

} // namespace pyracms
