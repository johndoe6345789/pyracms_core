#pragma once

#include "chunk_support.h"
#include "s3_mode.h"

namespace harness {

struct Chunked {
    Site site = makeSite();
    S3Mode mode;
    Chunked() { setenv("UPLOAD_PART_MB", "1", 1); }
    ~Chunked() { unsetenv("UPLOAD_PART_MB"); }
    std::string tok() const { return site.user.token; }
    Reply begin(const std::string &name, size_t size,
                const std::string &sha = "") {
        auto b = J({{"filename", name},
                    {"size", static_cast<Json::UInt64>(size)}});
        if (!sha.empty())
            b["sha256"] = sha;
        return post("/api/files/uploads", b, tok());
    }
    static std::string part(const std::string &id, int n) {
        return "/api/files/uploads/" + id + "/parts/" + std::to_string(n);
    }
};

inline const std::string kMiB(1 << 20, 'a');

} // namespace harness
