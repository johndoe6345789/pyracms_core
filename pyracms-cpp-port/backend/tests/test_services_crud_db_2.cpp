#include "db_fixture.h"
#include "services/CodeSnippetService.h"
#include "services/MenuService.h"
#include "services/TenantService.h"
#include "services/UserService.h"

using namespace pyracms;

TEST(SnippetCrudDb, CreateUpdateRunDelete) {
    REQUIRE_DB();
    CodeSnippetService svc;
    int t = makeTenant(db, uniq("sn"));
    int u = makeUser(db, t, uniq("su"));
    using R = std::pair<bool, int>;
    auto made = awaitValue<R>([&](auto cb) {
        svc.createSnippet(
            db, t, u, "T", "print(1)", "python", "public",
            [cb](bool ok, int id, const std::string &) { cb(R{ok, id}); });
    });
    ASSERT_TRUE(made.first);
    EXPECT_TRUE(awaitBool([&](auto cb) {
                    svc.updateSnippet(db, made.second, u, "T2", "c", "python",
                                      "private", cb);
                }).first);
    EXPECT_TRUE(awaitBool([&](auto cb) {
                    svc.recordExecution(db, made.second, u, "out", 0, 5, cb);
                }).first);
    EXPECT_TRUE(awaitBool([&](auto cb) {
                    svc.deleteSnippet(db, made.second, u, cb);
                }).first);
}
