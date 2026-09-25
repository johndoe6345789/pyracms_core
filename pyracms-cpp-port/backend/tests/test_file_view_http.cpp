#include "http_accounts.h"

using namespace harness;

namespace {
std::string mk(const std::string &tok, const std::string &name,
               const std::string &body) {
    auto r = upload("/api/files", tok, name, body);
    EXPECT_EQ(r.status, 200) << name << " " << r.text;
    return r.json["uuid"].asString();
}
} // namespace

TEST(FileViewHttp, OpensSafeKindsInPlaceAndNothingElse) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto u = s.user.token;
    const std::string png = std::string("\x89PNG\r\n\x1a\n", 8) + "data";
    auto pic = get("/api/files/" + mk(u, "p.png", png) + "/view");
    ASSERT_EQ(pic.status, 200);
    EXPECT_EQ(pic.text, png);
    EXPECT_EQ(pic.headers.count("content-disposition"), 0u); // not a download
    EXPECT_EQ(pic.headers["x-content-type-options"], "nosniff");
    EXPECT_NE(pic.headers["content-security-policy"].find("default-src 'none'"),
              std::string::npos);

    auto code = get("/api/files/" + mk(u, "run.py", "print(1)\n") + "/view");
    ASSERT_EQ(code.status, 200);
    EXPECT_EQ(code.text, "print(1)\n");
    EXPECT_EQ(code.headers["content-type"].rfind("text/plain", 0), 0u);
}

TEST(FileViewHttp, DownloadOnlyKindsAndMissingFilesAreRefused) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto u = s.user.token;
    auto zip = mk(u, "a.zip", "PK\3\4 zip");
    EXPECT_EQ(get("/api/files/" + zip + "/view").status, 415);
    EXPECT_EQ(get("/api/files/" + zip).status, 200); // still downloadable
    auto tool = mk(u, "tool.exe", "MZ");
    EXPECT_EQ(get("/api/files/" + tool + "/view").status, 415);
    EXPECT_EQ(get("/api/files/not-a-uuid/view").status, 404);
    EXPECT_EQ(get("/api/files/00000000-0000-4000-8000-000000000000/view")
                  .status, 404);
}
