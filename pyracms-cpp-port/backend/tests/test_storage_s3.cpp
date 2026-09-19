#include "http_harness.h"
#include "s3_mode.h"

#include <future>

using namespace pyracms;

TEST(S3Storage, ExistsAndInvalidIds) {
    REQUIRE_SERVER();
    harness::S3Mode mode;
    auto s3 = BlobRegistry::named("s3");
    auto wait = [&](auto call) {
        std::promise<BlobStatus> p;
        call([&](BlobStatus s) { p.set_value(s); });
        return p.get_future().get();
    };
    BlobKey k{0, "feed-beef", false};
    EXPECT_EQ(wait([&](auto cb) { s3->exists(k, cb); }), BlobStatus::NotFound);
    EXPECT_EQ(wait([&](auto cb) { s3->put(k, "z", cb); }), BlobStatus::Ok);
    EXPECT_EQ(wait([&](auto cb) { s3->exists(k, cb); }), BlobStatus::Ok);
    EXPECT_EQ(wait([&](auto cb) { s3->remove(k, cb); }), BlobStatus::Ok);
    BlobKey bad{0, "../../x", false};
    EXPECT_EQ(wait([&](auto cb) { s3->put(bad, "z", cb); }),
              BlobStatus::Failed);
    EXPECT_EQ(wait([&](auto cb) { s3->exists(bad, cb); }),
              BlobStatus::NotFound);
    EXPECT_EQ(wait([&](auto cb) { s3->remove(bad, cb); }),
              BlobStatus::NotFound);
    s3->get(bad, [](BlobStatus s, std::string) {
        EXPECT_EQ(s, BlobStatus::NotFound);
    });
}
