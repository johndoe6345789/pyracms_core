#include "services/SettingsService.h"

namespace pyracms {

SettingDto SettingsService::rowToDto(const drogon::orm::Row &row) {
    SettingDto dto;
    dto.id = row["id"].as<int>();
    dto.tenantId = row["tenant_id"].as<int>();
    dto.name = row["name"].as<std::string>();
    dto.value = row["value"].isNull() ? "" : row["value"].as<std::string>();
    return dto;
}

void SettingsService::listSettings(const DbClientPtr &db, int tenantId,
                                   ListCallback cb) {
    db->execSqlAsync(
        "SELECT * FROM settings WHERE tenant_id = $1 ORDER BY name",
        [this, cb](const drogon::orm::Result &result) {
            std::vector<SettingDto> settings;
            settings.reserve(result.size());
            for (const auto &row : result) {
                settings.push_back(rowToDto(row));
            }
            cb(settings);
        },
        [cb](const drogon::orm::DrogonDbException &) {
            cb({});
        },
        tenantId);
}

void SettingsService::getSetting(const DbClientPtr &db, int tenantId,
                                 const std::string &name, Callback cb) {
    db->execSqlAsync(
        "SELECT * FROM settings WHERE tenant_id = $1 AND name = $2",
        [this, cb](const drogon::orm::Result &result) {
            if (result.empty()) {
                cb(std::nullopt);
            } else {
                cb(rowToDto(result[0]));
            }
        },
        [cb](const drogon::orm::DrogonDbException &) {
            cb(std::nullopt);
        },
        tenantId, name);
}

void SettingsService::createOrUpdateSetting(const DbClientPtr &db,
                                            int tenantId,
                                            const std::string &name,
                                            const std::string &value,
                                            BoolCallback cb) {
    db->execSqlAsync(
        "INSERT INTO settings (tenant_id, name, value) "
        "VALUES ($1, $2, $3) "
        "ON CONFLICT (tenant_id, name) DO UPDATE SET value = EXCLUDED.value",
        [cb](const drogon::orm::Result &) {
            cb(true, "");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        tenantId, name, value);
}

void SettingsService::deleteSetting(const DbClientPtr &db, int tenantId,
                                    const std::string &name,
                                    BoolCallback cb) {
    db->execSqlAsync(
        "DELETE FROM settings WHERE tenant_id = $1 AND name = $2",
        [cb](const drogon::orm::Result &result) {
            if (result.affectedRows() == 0) {
                cb(false, "Setting not found");
            } else {
                cb(true, "");
            }
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        tenantId, name);
}

} // namespace pyracms
