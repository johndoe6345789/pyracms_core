#include "security/NetPort.h"
#include "services/cache/RedisPool.h"
#include "services/cache/RedisReader.h"

namespace pyracms {

namespace {

bool parse(RespReader &r, RespReply &out, int depth) {
    std::string l;
    if (!r.line(l) || l.empty() || depth > 2)
        return false;
    auto body = l.substr(1);
    try {
        switch (l[0]) {
        case '+':
            out.kind = RespReply::Text, out.text = body;
            return true;
        case '-':
            out.kind = RespReply::Error, out.text = body;
            return true;
        case ':':
            out.kind = RespReply::Integer, out.number = std::stoll(body);
            return true;
        case '$': {
            long n = std::stol(body);
            if (n < 0)
                return out.kind = RespReply::Nil, true;
            out.kind = RespReply::Text;
            return r.bytes(static_cast<size_t>(n), out.text);
        }
        case '*': {
            long n = std::stol(body);
            out.kind = RespReply::Array;
            for (long i = 0; i < n; ++i) {
                RespReply item;
                if (!parse(r, item, depth + 1))
                    return false;
                if (item.kind == RespReply::Array) // SCAN: [cursor, [keys]]
                    out.items.insert(out.items.end(), item.items.begin(),
                                     item.items.end());
                else
                    out.items.push_back(item.kind == RespReply::Integer
                                            ? std::to_string(item.number)
                                            : item.text);
            }
            return true;
        }
        }
    } catch (const std::exception &) {
    }
    return false;
}

} // namespace

RespReply readReply(int fd) {
    RespReader r{fd, {}, 0};
    RespReply out;
    out.ok = parse(r, out, 0);
    return out;
}

} // namespace pyracms
