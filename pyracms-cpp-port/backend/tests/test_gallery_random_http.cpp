#include "gallery_fixtures.h"

using namespace harness;
using namespace gfx;

TEST(GalleryRandom, RandomPhotoSkipsPrivateAlbums) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto url = "/api/gallery/random?tenant_id=" + std::to_string(s.id);
    EXPECT_EQ(get(url).status, 404);
    EXPECT_EQ(get("/api/gallery/random").status, 400);
    mkAlbum(s, true);
    EXPECT_EQ(get(url).status, 404);
    auto a = mkAlbum(s);
    auto r = get(url);
    ASSERT_EQ(r.status, 200) << r.text;
    EXPECT_EQ(r.json["fileUuid"].asString(), a.uuid);
    EXPECT_EQ(std::to_string(r.json["albumId"].asInt()), a.id);
}
