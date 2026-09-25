#include "services/cache/WsRelay.h"

#include <random>
#include <sstream>

namespace pyracms {

static const char *kChannel = "pyracms:ws";

WsRelay &WsRelay::instance() {
    static WsRelay r;
    return r;
}

WsRelay::WsRelay() {
    std::random_device rd;
    std::ostringstream id;
    id << std::hex << rd() << rd();
    node_ = id.str();
}

void WsRelay::on(const std::string &kind, Handler h) {
    std::lock_guard<std::mutex> lock(mu_);
    handlers_[kind] = std::move(h);
}

// "<node> <kind> <b|t> <keylen>\n<key><payload>": binary-safe, and the key
// may contain anything.
std::string WsRelay::pack(const std::string &node, const std::string &kind,
                          const std::string &key, bool binary,
                          const std::string &payload) {
    return node + " " + kind + (binary ? " b " : " t ") +
           std::to_string(key.size()) + "\n" + key + payload;
}

void WsRelay::publish(const std::string &kind, const std::string &key,
                      bool binary, const std::string &payload) {
    if (!pool_)
        return;
    pool_->command(
        {"PUBLISH", kChannel, pack(node_, kind, key, binary, payload)});
}

void WsRelay::deliver(const std::string &msg) {
    auto nl = msg.find('\n');
    if (nl == std::string::npos)
        return;
    std::istringstream head(msg.substr(0, nl));
    std::string node, kind, mode;
    size_t keylen = 0;
    head >> node >> kind >> mode >> keylen;
    if (node == node_ || nl + 1 + keylen > msg.size())
        return;
    Handler h;
    {
        std::lock_guard<std::mutex> lock(mu_);
        auto it = handlers_.find(kind);
        if (it == handlers_.end())
            return;
        h = it->second;
    }
    h(msg.substr(nl + 1, keylen), mode == "b", msg.substr(nl + 1 + keylen));
}

} // namespace pyracms
