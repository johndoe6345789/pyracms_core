#pragma once

#include <functional>
#include <future>
#include <string>

using BoolResult = std::pair<bool, std::string>;

// Wait for a service call reporting through BoolCallback(bool, string).
inline BoolResult awaitBool(
    const std::function<void(std::function<void(bool, const std::string &)>)>
        &start) {
    auto p = std::make_shared<std::promise<BoolResult>>();
    auto f = p->get_future();
    start([p](bool ok, const std::string &e) { p->set_value({ok, e}); });
    return f.get();
}

// Wait for a service call reporting through Callback(const T &).
template <typename T>
T awaitValue(const std::function<void(std::function<void(const T &)>)> &start) {
    auto p = std::make_shared<std::promise<T>>();
    auto f = p->get_future();
    start([p](const T &v) { p->set_value(v); });
    return f.get();
}
