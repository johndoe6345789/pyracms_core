#include "gallery_fixtures.h"

using namespace harness;
using namespace gfx;


TEST(GalleryOptions, SetAsCoverNeedsNoBodyAndShowsOnAlbumAndList) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto a = mkAlbum(s);
    EXPECT_EQ(get(albumUrl(s, a)).json["coverFileUuid"].asString(), "");
    EXPECT_EQ(put("/api/gallery/pictures/" + a.pic + "/default", J({}),
                  s.user.token).status, 200);
    EXPECT_EQ(get(albumUrl(s, a)).json["coverFileUuid"].asString(), a.uuid);
    auto list = get("/api/gallery/albums?tenant_id=" + std::to_string(s.id));
    EXPECT_EQ(list.json[0]["coverFileUuid"].asString(), a.uuid);
}

TEST(GalleryOptions, AlbumOptionsAreValidatedAndOptional) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto a = mkAlbum(s);
    auto other = mkAlbum(s);
    auto url = "/api/gallery/albums/" + a.id;
    auto u = s.user.token;
    EXPECT_EQ(put(url, J({{"displayName", "N"}, {"sortOrder", "bogus"}}), u)
                  .status, 400);
    ASSERT_EQ(put(url, J({{"displayName", "N"}, {"sortOrder", "title"},
                          {"isPrivate", true},
                          {"defaultPictureId", std::stoi(a.pic)}}), u).status,
              200);
    auto g = get(albumUrl(s, a), u);
    EXPECT_EQ(g.json["sortOrder"].asString(), "title");
    EXPECT_TRUE(g.json["isPrivate"].asBool());
    EXPECT_EQ(g.json["coverFileUuid"].asString(), a.uuid);
    // another album's picture is no valid cover; omitted = unchanged
    put(url, J({{"displayName", "N"},
                {"defaultPictureId", std::stoi(other.pic)}}), u);
    g = get(albumUrl(s, a), u);
    EXPECT_EQ(g.json["coverFileUuid"].asString(), a.uuid);
    EXPECT_EQ(g.json["sortOrder"].asString(), "title");
    put(url, J({{"displayName", "N"}, {"defaultPictureId", 0}}), u);
    EXPECT_EQ(get(albumUrl(s, a), u).json["coverFileUuid"], "");
}
