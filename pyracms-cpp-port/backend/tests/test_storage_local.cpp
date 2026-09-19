#include "http_harness.h"
#include "s3_mode.h"

#include <future>

using namespace pyracms;

TEST(BlobStorage, IdsAndStatuses) {
    EXPECT_TRUE(blobIdValid("0a1b-2c"));
    for (auto bad : {"", "../x", "a/b", "a b", "a.b"})
        EXPECT_FALSE(blobIdValid(bad));
    EXPECT_FALSE(blobIdValid(std::string(65, 'a')));
    EXPECT_EQ(blobHttpStatus(BlobStatus::Ok), 200);
    EXPECT_EQ(blobHttpStatus(BlobStatus::NotFound), 404);
    EXPECT_EQ(blobHttpStatus(BlobStatus::Failed), 502);
    EXPECT_EQ(blobHttpStatus(BlobStatus::Unavailable), 503);
}

TEST(LocalDiskStorage, RoundTripAndTraversalRefused) {
    auto dir = "/tmp/" + uniq("blobs");
    LocalDiskStorage st([dir] { return dir; });
    auto wait = [](auto call) {
        std::promise<BlobStatus> p;
        call([&](BlobStatus s) { p.set_value(s); });
        return p.get_future().get();
    };
    BlobKey k{3, "abc-123", false}, t{3, "abc-123", true}, bad{0, "../x"};
    EXPECT_EQ(wait([&](auto cb) { st.put(k, "hello", cb); }), BlobStatus::Ok);
    EXPECT_EQ(wait([&](auto cb) { st.put(t, "th", cb); }), BlobStatus::Ok);
    EXPECT_EQ(wait([&](auto cb) { st.exists(t, cb); }), BlobStatus::Ok);
    std::string got;
    st.get(k, [&](BlobStatus, std::string d) { got = d; });
    EXPECT_EQ(got, "hello");
    EXPECT_EQ(*st.path(k), dir + "/abc-123");
    EXPECT_EQ(*st.path(t), dir + "/thumbnails/abc-123");
    EXPECT_EQ(wait([&](auto cb) { st.put(bad, "x", cb); }),
              BlobStatus::Failed);
    EXPECT_EQ(wait([&](auto cb) { st.exists(bad, cb); }),
              BlobStatus::NotFound);
    EXPECT_EQ(wait([&](auto cb) { st.remove(k, cb); }), BlobStatus::Ok);
    EXPECT_EQ(wait([&](auto cb) { st.remove(k, cb); }), BlobStatus::NotFound);
    st.get(k, [&](BlobStatus s, std::string) {
        EXPECT_EQ(s, BlobStatus::NotFound);
    });
}
