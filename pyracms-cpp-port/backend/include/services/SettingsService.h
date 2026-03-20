#pragma once

#include <drogon/drogon.h>
#include <functional>
#include <optional>
#include <string>

namespace pyracms {

struct SettingDto {
    int id;
    int tenantId;
    std::string name;
    std::string value;
};

class SettingsService {
public:
    using DbClientPtr = drogon::orm::DbClientPtr;
    using Callback = std::function<void(const std::optional<SettingDto> &)>;
    using ListCallback = std::function<void(const std::vector<SettingDto> &)>;
    using BoolCallback = std::function<void(bool success, const std::string &error)>;

    void listSettings(const DbClientPtr &db, int tenantId,
                      ListCallback cb);

    void getSetting(const DbClientPtr &db, int tenantId,
                    const std::string &name, Callback cb);

    void createOrUpdateSetting(const DbClientPtr &db, int tenantId,
                               const std::string &name,
                               const std::string &value,
                               BoolCallback cb);

    void deleteSetting(const DbClientPtr &db, int tenantId,
                       const std::string &name, BoolCallback cb);

private:
    SettingDto rowToDto(const drogon::orm::Row &row);
};

} // namespace pyracms
