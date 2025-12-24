#ifndef PYRACMS_SERVER_H
#define PYRACMS_SERVER_H

#include <string>
#include <memory>
#include <functional>

namespace pyracms {

class Server {
public:
    Server(const std::string& host, int port);
    ~Server();

    void start();
    void stop();
    
    // Route handlers
    void addRoute(const std::string& method, const std::string& path,
                  std::function<std::string(const std::string&)> handler);

private:
    class Impl;
    std::unique_ptr<Impl> pImpl;
    
    std::string host_;
    int port_;
    bool running_;
};

} // namespace pyracms

#endif // PYRACMS_SERVER_H
