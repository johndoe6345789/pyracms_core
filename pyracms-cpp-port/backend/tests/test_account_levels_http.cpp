#include "http_accounts.h"

using namespace harness;

TEST(AccountModel, OnlyTheSiteAdministratorMakesModerators) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto id = std::to_string(s.user.id);
    auto body = J({{"role", 2}});
    EXPECT_EQ(put("/api/users/" + id + "/role", body, s.user.token).status,
              403);
    EXPECT_EQ(put("/api/users/" + id + "/role", body, s.admin.token).status,
              200);
}
