#include "services/CacheService.h"

namespace pyracms {

// Deletes every key matching `pattern` (SCAN in small steps, never KEYS,
// which would stall Redis for everybody).
void CacheService::delPattern(const std::string &pattern, BoolCallback cb) {
    if (!connected_ || !pool_)
        return cb(false);
    std::string cursor = "0";
    for (int round = 0; round < 50; ++round) {
        auto r = pool_->command(
            {"SCAN", cursor, "MATCH", pattern, "COUNT", "200"});
        if (!r.ok || r.kind != RespReply::Array || r.items.empty())
            return cb(false);
        cursor = r.items[0];
        std::vector<std::string> del{"DEL"};
        del.insert(del.end(), r.items.begin() + 1, r.items.end());
        if (del.size() > 1 && !pool_->command(del).ok)
            return cb(false);
        if (cursor == "0")
            break;
    }
    cb(true);
}

} // namespace pyracms
