#include "storage/S3Storage.h"
#include "storage/S3StreamJob.h"
#include <thread>

namespace pyracms {

namespace {

const int kMaxStreams = 16;
std::atomic<int> gStreams{0};

BlobStatus outcome(CURLcode rc, const StreamJob &j) {
    if (j.code == 404)
        return BlobStatus::NotFound;
    if (rc == CURLE_OK || (j.headed && j.sent >= j.length))
        return j.code == 200 ? BlobStatus::Ok : BlobStatus::Failed;
    return rc == CURLE_HTTP_RETURNED_ERROR || j.code >= 400
               ? BlobStatus::Failed
               : BlobStatus::Unavailable;
}

} // namespace

// One thread per download: curl's blocking transfer pushes into a bounded
// BlobStream, so memory stays at a few MiB however big the object is.
void S3Storage::stream(const BlobKey &k, size_t skip, size_t length,
                       StreamCb cb) {
    if (!blobIdValid(k.id) || gStreams >= kMaxStreams)
        return cb(BlobStatus::Unavailable, nullptr);
    ++gStreams;
    auto url = ep_.origin + ep_.prefix + objectPath(k);
    auto auth = "Authorization: AWS " + cfg_.accessKey + ":" + cfg_.secretKey;
    std::thread([=] {
        StreamJob j;
        j.head = cb;
        j.skip = skip;
        j.length = length;
        j.easy = curl_easy_init();
        curl_slist *h = curl_slist_append(nullptr, auth.c_str());
        curl_easy_setopt(j.easy, CURLOPT_URL, url.c_str());
        curl_easy_setopt(j.easy, CURLOPT_HTTPHEADER, h);
        curl_easy_setopt(j.easy, CURLOPT_CONNECTTIMEOUT, 10L);
        curl_easy_setopt(j.easy, CURLOPT_LOW_SPEED_LIMIT, 1024L);
        curl_easy_setopt(j.easy, CURLOPT_LOW_SPEED_TIME, 60L);
        curl_easy_setopt(j.easy, CURLOPT_WRITEFUNCTION, s3OnBody);
        curl_easy_setopt(j.easy, CURLOPT_WRITEDATA, &j);
        CURLcode rc = curl_easy_perform(j.easy);
        if (!j.headed && j.code == 0)
            curl_easy_getinfo(j.easy, CURLINFO_RESPONSE_CODE, &j.code);
        auto st = outcome(rc, j);
        j.announce(st == BlobStatus::Ok ? BlobStatus::Ok : st);
        j.out->finish(st == BlobStatus::Ok);
        curl_slist_free_all(h);
        curl_easy_cleanup(j.easy);
        --gStreams;
    }).detach();
}

} // namespace pyracms
