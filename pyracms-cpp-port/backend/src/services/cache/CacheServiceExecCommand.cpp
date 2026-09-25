#include "services/CacheService.h"

namespace pyracms {

std::string CacheService::execCommand(const std::vector<std::string> &args) {
    if (!pool_)
        return "";
    auto r = pool_->command(args);
    if (!r.ok || r.kind == RespReply::Error)
        return "";
    return r.kind == RespReply::Integer ? std::to_string(r.number) : r.text;
}

} // namespace pyracms
