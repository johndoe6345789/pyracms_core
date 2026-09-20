#include "http_accounts.h"

#include "services/AuthService.h"

#include <algorithm>

namespace harness {

// Platform accounts are not created by sign-up (only by first-run
// setup), so tests insert them directly and sign in for a token.
static Acct platformAccount(int role) {
    Acct a;
    a.name = uniq("hu");
    auto hash = pyracms::AuthService().hashPassword("password123");
    auto r = testDb()->execSqlSync(
        "INSERT INTO users (username, full_name, email, password_hash, "
        "timezone, banned, created_at, api_uuid, tenant_id, role) "
        "VALUES ($1, '', $2, $3, 'UTC', false, NOW(), "
        "gen_random_uuid()::text, NULL, $4) RETURNING id",
        a.name, a.name + "@h.test", hash, role);
    a.id = r[0]["id"].as<int>();
    Json::Value b;
    b["username"] = a.name;
    b["password"] = "password123";
    a.token = post("/api/auth/login", b).json["token"].asString();
    return a;
}

Acct signup(const std::string &slug, int role) {
    if (slug.empty())
        return platformAccount(role);
    Acct a;
    a.name = uniq("hu");
    Json::Value b;
    b["username"] = a.name;
    b["email"] = a.name + "@h.test";
    b["password"] = "password123";
    b["tenant"] = slug;
    auto r = post("/api/auth/register", b);
    a.token = r.json["token"].asString();
    a.id = r.json["user"]["id"].asInt();
    a.tenant = r.json["user"].get("tenantId", 0).asInt();
    testDb()->execSqlSync("UPDATE users SET role = $1 WHERE id = $2", role,
                          a.id);
    return a;
}

Acct platformAdmin() {
    return signup("", 4);
}

int newTenant(const Acct &admin, std::string &slug) {
    slug = uslug("ht");
    Json::Value b;
    b["slug"] = slug;
    b["displayName"] = "Site " + slug;
    post("/api/tenants", b, admin.token);
    return get("/api/tenants/" + slug).json["id"].asInt();
}

Site makeSite() {
    static Acct pa = platformAdmin();
    Site s;
    s.id = newTenant(pa, s.slug);
    s.admin = signup(s.slug, 3);
    s.user = signup(s.slug, 1);
    return s;
}

std::string authorToken(const Site &s) {
    testDb()->execSqlSync("UPDATE users SET role = 2 WHERE id = $1",
                          s.user.id);
    return s.user.token;
}

} // namespace harness
