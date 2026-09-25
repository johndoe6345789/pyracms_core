#include "db_fixture.h"
#include "services/CodeSnippetService.h"

using namespace pyracms;

namespace {
CodeSnippetService svc;
using Snip = std::optional<CodeSnippetDto>;

int makeSnippet(const drogon::orm::DbClientPtr &db, int tenant, int author,
                const std::string &visibility) {
    return db
        ->execSqlSync("INSERT INTO code_snippets (tenant_id, author_id, title, "
                      "code, visibility) VALUES ($1, $2, 't', 'c', $3) "
                      "RETURNING id",
                      tenant, author, visibility)[0]["id"]
        .as<int>();
}

Snip get(const drogon::orm::DbClientPtr &db, int id, int scope, int viewer) {
    return awaitValue<Snip>(
        [&](auto cb) { svc.getSnippet(db, id, scope, viewer, cb); });
}
} // namespace

TEST(SnippetScopeDb, PublicVisibleToAnonymousInScope) {
    REQUIRE_DB();
    int t = makeTenant(db, uniq("sa"));
    int s = makeSnippet(db, t, makeUser(db, t, uniq("au")), "public");
    EXPECT_TRUE(get(db, s, t, 0));
    EXPECT_TRUE(get(db, s, 0, 0));
}

TEST(SnippetScopeDb, ForeignTenantSees404) {
    REQUIRE_DB();
    int t = makeTenant(db, uniq("sb")), other = makeTenant(db, uniq("sc"));
    int s = makeSnippet(db, t, makeUser(db, t, uniq("au")), "public");
    EXPECT_FALSE(get(db, s, other, 0));
}

TEST(SnippetScopeDb, PrivateOnlyForAuthor) {
    REQUIRE_DB();
    int t = makeTenant(db, uniq("sd"));
    int author = makeUser(db, t, uniq("au")), me = makeUser(db, t, uniq("me"));
    int s = makeSnippet(db, t, author, "private");
    EXPECT_FALSE(get(db, s, t, 0));
    EXPECT_FALSE(get(db, s, t, me));
    EXPECT_TRUE(get(db, s, t, author));
}

TEST(SnippetScopeDb, ListHidesPrivateFromOthers) {
    REQUIRE_DB();
    int t = makeTenant(db, uniq("se"));
    int author = makeUser(db, t, uniq("au"));
    makeSnippet(db, t, author, "public");
    makeSnippet(db, t, author, "private");
    using Page = std::pair<std::vector<CodeSnippetDto>, int>;
    auto list = [&](int viewer) {
        return awaitValue<Page>([&](auto cb) {
            svc.listSnippets(db, t, "", 0, viewer, "", 20, 0,
                             [cb](const std::vector<CodeSnippetDto> &v, int n) {
                                 cb(Page{v, n});
                             });
        });
    };
    EXPECT_EQ(list(0).second, 1);
    EXPECT_EQ(list(author).second, 2);
}
