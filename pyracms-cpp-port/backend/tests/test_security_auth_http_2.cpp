#include "http_accounts.h"
#include "security/Hash.h"
#include "security/RateLimiter.h"
#include "services/UserService.h"

#include <future>
#include <thread>

using namespace harness;
using pyracms::RateLimiter;

namespace {
Json::Value creds(const std::string &user, const std::string &pw,
                  const std::string &slug = "") {
    Json::Value b = J({{"username", user}, {"password", pw}});
    if (!slug.empty())
        b["tenant"] = slug;
    return b;
}

// Base64url without padding (to build tokens by hand).
std::string b64url(const std::string &in) {
    static const char *t =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
    std::string out;
    for (size_t i = 0; i < in.size(); i += 3) {
        unsigned v = static_cast<unsigned char>(in[i]) << 16;
        if (i + 1 < in.size())
            v |= static_cast<unsigned char>(in[i + 1]) << 8;
        if (i + 2 < in.size())
            v |= static_cast<unsigned char>(in[i + 2]);
        out += t[(v >> 18) & 63];
        out += t[(v >> 12) & 63];
        if (i + 1 < in.size())
            out += t[(v >> 6) & 63];
        if (i + 2 < in.size())
            out += t[v & 63];
    }
    return out;
}
} // namespace

TEST(SecurityAuth, ConcurrentFirstSignupsCreateExactlyOneOwner) {
    REQUIRE_SERVER();
    auto pa = platformAdmin();
    std::string slug;
    int tenant = newTenant(pa, slug);
    ASSERT_GT(tenant, 0);
    pyracms::UserService svc;
    std::vector<std::future<bool>> results;
    for (int i = 0; i < 8; ++i) {
        results.push_back(std::async(std::launch::async, [&, i] {
            auto p = std::make_shared<std::promise<bool>>();
            auto f = p->get_future();
            svc.registerAccount(
                testDb(), tenant, "race" + std::to_string(i), "",
                "race" + std::to_string(i) + "@h.test", "hash", 0,
                [p](bool ok, const std::string &, bool first) {
                    p->set_value(ok && first);
                });
            return f.get();
        }));
    }
    int owners = 0;
    for (auto &r : results)
        owners += r.get() ? 1 : 0;
    EXPECT_EQ(owners, 1);
    auto rows = testDb()->execSqlSync(
        "SELECT COUNT(*) FILTER (WHERE role = 3) AS admins, "
        "COUNT(*) FILTER (WHERE is_first) AS firsts, COUNT(*) AS n "
        "FROM users WHERE tenant_id = $1", tenant);
    EXPECT_EQ(rows[0]["admins"].as<int>(), 1);
    EXPECT_EQ(rows[0]["firsts"].as<int>(), 1);
    EXPECT_EQ(rows[0]["n"].as<int>(), 8);
}
