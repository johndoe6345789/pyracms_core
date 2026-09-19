#pragma once

#include <algorithm>
#include <cctype>
#include <string>

namespace pyracms {

// Upload / download rules. Pure and unit-tested.

// Last path component only; control characters, quotes, backslashes,
// semicolons and percent signs dropped (the name ends up in a
// Content-Disposition header); at most 100 bytes; never empty.
inline std::string safeFilename(const std::string &raw) {
    auto slash = raw.find_last_of("/\\");
    std::string name = slash == std::string::npos ? raw : raw.substr(slash + 1);
    std::string out;
    for (unsigned char c : name) {
        if (c < 0x20 || c == 0x7f || c == '"' || c == '\'' || c == ';' ||
            c == '%' || c == '<' || c == '>' || c == ':')
            continue;
        out += static_cast<char>(c);
    }
    while (!out.empty() && out.front() == '.')
        out.erase(out.begin());
    if (out.size() > 100)
        out = out.substr(out.size() - 100);
    return out.empty() ? "file" : out;
}

inline std::string fileExtension(const std::string &filename) {
    auto dot = filename.rfind('.');
    if (dot == std::string::npos)
        return "";
    auto ext = filename.substr(dot + 1);
    std::transform(ext.begin(), ext.end(), ext.begin(), ::tolower);
    return ext;
}

// Signature check for the formats browsers would otherwise sniff.
inline bool magicMatches(const std::string &ext, const std::string &data) {
    auto starts = [&](const char *sig, size_t n) {
        return data.size() >= n && data.compare(0, n, sig, n) == 0;
    };
    if (ext == "png")
        return starts("\x89PNG\r\n\x1a\n", 8);
    if (ext == "jpg" || ext == "jpeg")
        return starts("\xff\xd8\xff", 3);
    if (ext == "gif")
        return starts("GIF87a", 6) || starts("GIF89a", 6);
    if (ext == "webp")
        return starts("RIFF", 4) && data.size() >= 12 &&
               data.compare(8, 4, "WEBP") == 0;
    if (ext == "pdf")
        return starts("%PDF-", 5);
    if (ext == "zip")
        return starts("PK", 2);
    return true; // text-like or unchecked formats
}

// Only these content types are ever echoed back; anything else is served
// as an opaque download.
inline std::string servedMime(const std::string &stored) {
    static const char *ok[] = {
        "image/png",       "image/jpeg", "image/gif",  "image/webp",
        "image/svg+xml",   "video/mp4",  "video/webm", "application/json",
        "text/plain",      "application/zip", "application/pdf"};
    for (const char *m : ok) {
        if (stored == m)
            return stored;
    }
    return "application/octet-stream";
}

} // namespace pyracms
