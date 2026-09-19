#include "http_accounts.h"

namespace harness {

Acct signup(const std::string &slug, int role) {
    Acct a;
    a.name = uniq("hu");
    Json::Value b;
    b["username"] = a.name;
    b["email"] = a.name + "@h.test";
    b["password"] = "password123";
    if (!slug.empty())
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
    slug = uniq("ht");
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

} // namespace harness
