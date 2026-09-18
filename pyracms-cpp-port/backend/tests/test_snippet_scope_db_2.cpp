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

TEST(SnippetScopeDb, ForkRespectsTenantAndVisibility) {
    REQUIRE_DB();
    int t = makeTenant(db, uniq("sf")), other = makeTenant(db, uniq("sg"));
    int author = makeUser(db, t, uniq("au")), me = makeUser(db, t, uniq("me"));
    int priv = makeSnippet(db, t, author, "private");
    int pub = makeSnippet(db, t, author, "public");
    using R = std::pair<bool, int>;
    auto fork = [&](int id, int user, int tenant) {
        return awaitValue<R>([&](auto cb) {
            svc.forkSnippet(db, id, user, tenant,
                            [cb](bool ok, int nid, const std::string &) {
                                cb(R{ok, nid});
                            });
        });
    };
    EXPECT_FALSE(fork(priv, me, t).first);
    EXPECT_FALSE(fork(pub, me, other).first);
    EXPECT_TRUE(fork(pub, me, t).first);
}
