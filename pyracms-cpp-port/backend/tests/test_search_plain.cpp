#include "http_accounts.h"

using namespace harness;

namespace {
std::string plain(const std::string &raw) {
    auto r = testDb()->execSqlSync("SELECT search_plain($1) AS t", raw);
    return r[0]["t"].as<std::string>();
}
} // namespace

TEST(SearchPlain, StripsMarkupLinksAndFileIds) {
    EXPECT_EQ(plain("<p>Hello <b>golf</b> fans</p>"), "Hello golf fans");
    EXPECT_EQ(plain("-----\nDriver swing\n-----\n.. image:: /api/files/"
                    "11fc0ba2-e423\nsetup"),
              "Driver swing setup");
    EXPECT_EQ(plain("See [the tips](http://x.y/z) and `this <http://a.b>`_."),
              "See the tips and this .");
    EXPECT_EQ(plain("# Title\n**bold** _it_ https://a.b/c d"),
              "Title bold it d");
    EXPECT_EQ(plain("a &nbsp; b"), "a b");
    // Windows line endings, image options and table rules
    EXPECT_EQ(plain("------\r\nTrainz\r\n------\r\n:alt: Tom\r\n:width: 6\r\n"
                    "=====\r\nend"),
              "Trainz end");
    EXPECT_EQ(plain(""), "");
}

TEST(SearchPlain, AlbumsAndPicturesAreSearchable) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto u = s.user.token;
    ASSERT_TRUE(ok(post("/api/gallery/albums",
                        J({{"displayName", "Links Day"}, {"tenantId", s.id},
                           {"description", "<b>golf</b> trip"}}), u)));
    auto rows = testDb()->execSqlSync(
        "SELECT doc_type, title, body, url FROM search_documents "
        "WHERE tenant_id = $1 AND doc_type = 'album'", s.id);
    ASSERT_EQ(rows.size(), 1u);
    EXPECT_EQ(rows[0]["title"].as<std::string>(), "Links Day");
    EXPECT_EQ(rows[0]["body"].as<std::string>(), "golf trip");
    EXPECT_EQ(rows[0]["url"].as<std::string>().rfind("/gallery/", 0), 0u);
}
