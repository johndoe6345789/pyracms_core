#pragma once

#include <string>
#include <utility>

namespace pyracms {

// "pygame==2.6.1" -> {"pygame", "==2.6.1"}; "numpy" -> {"numpy", ""}.
inline std::pair<std::string, std::string>
gdSplitRequirement(const std::string &req) {
    auto b = req.find_first_not_of(" \t");
    if (b == std::string::npos)
        return {};
    auto e = req.find_first_of("=<>~!;[ ", b);
    if (e == std::string::npos)
        return {req.substr(b), ""};
    auto v = req.find_first_not_of(" \t", e);
    std::string ver = v == std::string::npos ? "" : req.substr(v);
    while (!ver.empty() && (ver.back() == ' ' || ver.back() == '\r'))
        ver.pop_back();
    return {req.substr(b, e - b), ver};
}

} // namespace pyracms
