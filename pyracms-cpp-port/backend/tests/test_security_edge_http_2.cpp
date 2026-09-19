#include "http_accounts.h"

using namespace harness;

namespace {
std::string tq(const Site &s) { return "?tenant_id=" + std::to_string(s.id); }
const std::string kPng = std::string("\x89PNG\r\n\x1a\n", 8) + "pixels";
} // namespace

TEST(SecurityFiles, UploadsAreOwnedSanitisedAndServedInertly) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto other = signup(s.slug);
    auto up = upload("/api/files", s.user.token, "../../evil.png", kPng);
    ASSERT_EQ(up.status, 200) << up.text;
    EXPECT_EQ(up.json["filename"].asString(), "evil.png");
    auto uuid = up.json["uuid"].asString();
    auto dl = get("/api/files/" + uuid);
    EXPECT_EQ(dl.status, 200);
    EXPECT_NE(dl.headers["content-type"].find("image/png"), std::string::npos);
    EXPECT_NE(dl.headers["content-disposition"].find("attachment"),
              std::string::npos);
    EXPECT_EQ(dl.headers["content-disposition"].find(".."), std::string::npos);
    EXPECT_EQ(dl.headers["x-content-type-options"], "nosniff");
    // owner-only delete; listing is scoped
    EXPECT_EQ(del("/api/files/" + uuid, other.token).status, 403);
    auto mine = get("/api/files", s.user.token);
    auto theirs = get("/api/files", other.token);
    EXPECT_NE(mine.text.find(uuid), std::string::npos);
    EXPECT_EQ(theirs.text.find(uuid), std::string::npos);
    EXPECT_NE(get("/api/files", s.admin.token).text.find(uuid),
              std::string::npos);
    auto foreign = makeSite();
    EXPECT_EQ(get("/api/files", foreign.admin.token).text.find(uuid),
              std::string::npos);
    EXPECT_EQ(del("/api/files/" + uuid, foreign.admin.token).status, 403);
    // traversal and junk ids never reach the filesystem
    for (const char *bad : {"..", "..%2F..%2Fetc%2Fpasswd", "not-a-uuid",
                            "%2e%2e"}) {
        EXPECT_NE(del(std::string("/api/files/") + bad, s.admin.token).status,
                  200) << bad;
        EXPECT_EQ(get(std::string("/api/files/") + bad).status, 404) << bad;
    }
    // active content is refused or neutralised
    EXPECT_EQ(upload("/api/files", s.user.token, "x.gif", "<script>").status,
              415);
    auto svg = upload("/api/files", s.user.token, "v.svg", "<svg onload=x/>");
    ASSERT_EQ(svg.status, 200);
    auto got = get("/api/files/" + svg.json["uuid"].asString());
    EXPECT_NE(got.headers["content-security-policy"].find("sandbox"),
              std::string::npos);
    EXPECT_EQ(del("/api/files/" + uuid, s.admin.token).status, 200);
}
