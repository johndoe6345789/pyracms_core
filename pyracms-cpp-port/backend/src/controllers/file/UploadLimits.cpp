#include "controllers/UploadLimits.h"

#include <algorithm>
#include <cstdlib>

namespace pyracms {

static int envMb(const char *name, int def, int lo, int hi) {
    const char *v = std::getenv(name);
    int n = v ? std::atoi(v) : def;
    return n >= lo && n <= hi ? n : def;
}

size_t defaultBodyBytes() {
    return static_cast<size_t>(envMb("MAX_UPLOAD_MB", 25, 1, 512)) << 20;
}

size_t uploadPartBytes() {
    return static_cast<size_t>(envMb("UPLOAD_PART_MB", 50, 1, 90)) << 20;
}

int64_t maxChunkedBytes() {
    return static_cast<int64_t>(
               envMb("MAX_CHUNKED_UPLOAD_MB", 1024, 1, 10240))
           << 20;
}

int partsFor(int64_t size) {
    auto part = static_cast<int64_t>(uploadPartBytes());
    return static_cast<int>(std::max<int64_t>(1, (size + part - 1) / part));
}

size_t globalBodyBytes() {
    return std::max(defaultBodyBytes(), uploadPartBytes() + (1u << 20));
}

size_t streamMinBytes() {
    return static_cast<size_t>(envMb("STREAM_MIN_MB", 8, 0, 4096)) << 20;
}

bool isPartPath(const std::string &path) {
    static const std::string pre = "/api/files/uploads/";
    if (path.compare(0, pre.size(), pre) != 0)
        return false;
    auto rest = path.substr(pre.size());
    auto slash = rest.find("/parts/");
    return slash != std::string::npos && slash > 0 &&
           rest.find('/', slash + 7) == std::string::npos;
}

} // namespace pyracms
