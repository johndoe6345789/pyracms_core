#include "http_accounts.h"

using namespace harness;

namespace {
std::string makeSnippet(const Site &s) {
    auto c = post("/api/snippets",
                  J({{"title", "S"}, {"code", "print(1)"},
                     {"tenant_id", s.id}}),
                  s.user.token);
    return std::to_string(c.json["id"].asInt());
}

std::string uploadFile(const std::string &token) {
    return upload("/api/files", token, "input.txt", "hello").json["uuid"]
        .asString();
}
} // namespace

TEST(SnippetAttachmentHttp, AddListRemove) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto id = makeSnippet(s);
    auto fileUuid = uploadFile(s.user.token);

    auto add = post("/api/snippets/" + id + "/attachments",
                    J({{"fileUuid", fileUuid}}), s.user.token);
    ASSERT_EQ(add.status, 201) << add.text;

    auto got = get("/api/snippets/" + id + "?tenant_id=" +
                   std::to_string(s.id));
    ASSERT_EQ(got.status, 200);
    ASSERT_EQ(got.json["attachments"].size(), 1u);
    EXPECT_EQ(got.json["attachments"][0]["fileUuid"].asString(), fileUuid);
    EXPECT_EQ(got.json["attachments"][0]["filename"].asString(), "input.txt");
    auto attId = std::to_string(got.json["attachments"][0]["id"].asInt());

    EXPECT_EQ(del("/api/snippets/" + id + "/attachments/" + attId,
                  s.user.token).status, 200);
    got = get("/api/snippets/" + id + "?tenant_id=" + std::to_string(s.id));
    EXPECT_EQ(got.json["attachments"].size(), 0u);
}

TEST(SnippetAttachmentHttp, RejectsBadOrForeignRequests) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto id = makeSnippet(s);
    auto fileUuid = uploadFile(s.user.token);

    EXPECT_EQ(post("/api/snippets/" + id + "/attachments", J({{"x", 1}}),
                   s.user.token).status, 400);
    EXPECT_EQ(post("/api/snippets/" + id + "/attachments",
                   J({{"fileUuid", "not-a-uuid"}}), s.user.token).status,
              400);
    EXPECT_EQ(post("/api/snippets/" + id + "/attachments",
                   J({{"fileUuid", fileUuid}}), "").status, 401);

    auto other = signup(s.slug);
    EXPECT_EQ(post("/api/snippets/" + id + "/attachments",
                   J({{"fileUuid", fileUuid}}), other.token).status, 404);

    ASSERT_EQ(post("/api/snippets/" + id + "/attachments",
                   J({{"fileUuid", fileUuid}}), s.user.token).status, 201);
    auto got = get("/api/snippets/" + id + "?tenant_id=" +
                   std::to_string(s.id));
    auto attId = std::to_string(got.json["attachments"][0]["id"].asInt());
    EXPECT_EQ(del("/api/snippets/" + id + "/attachments/" + attId,
                  other.token).status, 404);
}
