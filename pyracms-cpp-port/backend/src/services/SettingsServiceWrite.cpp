#include "services/SettingsService.h"

#include "filters/FeatureCache.h"
#include "services/DbError.h"

namespace pyracms {

void SettingsService::createOrUpdateSetting(const DbClientPtr &db, int tenantId,
                                            const std::string &name,
                                            const std::string &value,
                                            BoolCallback cb) {
    db->execSqlAsync(
        "INSERT INTO settings (tenant_id, name, value) "
        "VALUES ($1, $2, $3) "
        "ON CONFLICT (tenant_id, name) DO UPDATE SET value = EXCLUDED.value",
        [cb](const drogon::orm::Result &) {
            FeatureCache::instance().clear();
            cb(true, "");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, dbError(e));
        },
        tenantId, name, value);
}

void SettingsService::deleteSetting(const DbClientPtr &db, int tenantId,
                                    const std::string &name, BoolCallback cb) {
    db->execSqlAsync(
        "DELETE FROM settings WHERE tenant_id = $1 AND name = $2",
        [cb](const drogon::orm::Result &result) {
            if (result.affectedRows() == 0) {
                cb(false, "Setting not found");
            } else {
                FeatureCache::instance().clear();
                cb(true, "");
            }
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, dbError(e));
        },
        tenantId, name);
}

} // namespace pyracms
