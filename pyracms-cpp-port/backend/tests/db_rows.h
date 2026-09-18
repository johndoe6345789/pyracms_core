#pragma once

#include <drogon/orm/DbClient.h>
#include <string>

inline int makeTenant(const drogon::orm::DbClientPtr &db,
                      const std::string &slug) {
    return db
        ->execSqlSync(
            "INSERT INTO tenants (slug, display_name) VALUES ($1, $1) "
            "RETURNING id",
            slug)[0]["id"]
        .as<int>();
}

inline int makeUser(const drogon::orm::DbClientPtr &db, int tenantId,
                    const std::string &name, int role = 1) {
    return db
        ->execSqlSync("INSERT INTO users (username, full_name, email, "
                      "password_hash, timezone, banned, created_at, api_uuid, "
                      "tenant_id, role) VALUES ($1::text, $1::text, $1::text "
                      "|| '@t.test', 'x', "
                      "'UTC', false, NOW(), gen_random_uuid()::text, "
                      "NULLIF($2, 0), $3) RETURNING id",
                      name, tenantId, role)[0]["id"]
        .as<int>();
}
