#pragma once

#include "http_harness.h"

#include <atomic>
#include <condition_variable>
#include <drogon/WebSocketClient.h>
#include <mutex>
#include <trantor/net/EventLoopThread.h>

namespace wsc {

// A minimal websocket client that records what the server sends.
struct Sock {
    drogon::WebSocketClientPtr client;
    std::mutex mu;
    std::condition_variable cv;
    std::vector<std::string> got;
    std::atomic<bool> opened{false}, closed{false};

    bool waitMsg(int ms) {
        std::unique_lock<std::mutex> lk(mu);
        return cv.wait_for(lk, std::chrono::milliseconds(ms),
                           [&] { return !got.empty(); });
    }
    bool waitDone(int ms) {
        for (int i = 0; i < ms / 20 && !closed && !opened; ++i)
            usleep(20000);
        return closed || opened;
    }
};

inline std::shared_ptr<Sock> connect(const std::string &path) {
    (void)harness::server();
    auto s = std::make_shared<Sock>();
    static trantor::EventLoopThread loop;
    static bool started = (loop.run(), true);
    (void)started;
    s->client = drogon::WebSocketClient::newWebSocketClient(
        "127.0.0.1", 3299, false, loop.getLoop());
    s->client->setMessageHandler(
        [s](const std::string &m, const drogon::WebSocketClientPtr &,
            const drogon::WebSocketMessageType &) {
            std::lock_guard<std::mutex> lk(s->mu);
            s->got.push_back(m);
            s->cv.notify_all();
        });
    s->client->setConnectionClosedHandler(
        [s](const drogon::WebSocketClientPtr &) { s->closed = true; });
    auto req = drogon::HttpRequest::newHttpRequest();
    req->setPath(path);
    s->client->connectToServer(
        req, [s](drogon::ReqResult r, const drogon::HttpResponsePtr &,
                 const drogon::WebSocketClientPtr &) {
            if (r == drogon::ReqResult::Ok)
                s->opened = true;
            else
                s->closed = true;
        });
    s->waitDone(3000);
    return s;
}

} // namespace wsc
