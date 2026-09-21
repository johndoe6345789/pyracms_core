#include "storage/S3StreamJob.h"

#include <algorithm>

namespace pyracms {

static const size_t kStreamSlice = 256 * 1024;
static const size_t kStreamPrefetch = 4u << 20;

size_t s3OnBody(char *p, size_t sz, size_t nm, void *u) {
    auto *j = static_cast<StreamJob *>(u);
    size_t n = sz * nm, all = n;
    if (!j->code)
        curl_easy_getinfo(j->easy, CURLINFO_RESPONSE_CODE, &j->code);
    if (j->code != 200) // an error page, not the object
        return 0;
    size_t drop = std::min(j->skip, n);
    j->skip -= drop;
    p += drop;
    n -= drop;
    n = std::min(n, j->length - j->sent);
    for (size_t off = 0; off < n; off += kStreamSlice) {
        size_t len = std::min(kStreamSlice, n - off);
        if (!j->out->push(std::string(p + off, len)))
            return 0;
    }
    j->sent += n;
    // Answer the client once a first slab is in hand (or all of it), so a
    // store that fails early still yields a clean error status.
    if (j->sent >= std::min(j->length, kStreamPrefetch))
        j->announce(BlobStatus::Ok);
    return j->sent >= j->length ? 0 : all; // 0 = stop early: done
}

} // namespace pyracms
