#pragma once

#include <condition_variable>
#include <memory>
#include <mutex>

#include "services/SecretStore.h"

using namespace Hypernucleus;

// A keychain call that never returns (until the test lets it go).
struct Gate {
    std::mutex m;
    std::condition_variable cv;
    bool open = false;
    void wait()
    {
        std::unique_lock<std::mutex> l(m);
        cv.wait(l, [this]() { return open; });
    }
    void release()
    {
        std::lock_guard<std::mutex> l(m);
        open = true;
        cv.notify_all();
    }
};

class HungStore : public SecretStore {
public:
    explicit HungStore(std::shared_ptr<Gate> g) : m_gate(std::move(g)) {}
    QString backendName() const override { return "hung"; }
    bool isAvailable() const override { return true; }
    bool write(const QString&, const QString&, const QString&) override
    {
        m_gate->wait();
        return true;
    }
    QString read(const QString&, const QString&) override
    {
        m_gate->wait();
        return "late";
    }
    bool remove(const QString&, const QString&) override
    {
        m_gate->wait();
        return true;
    }

private:
    std::shared_ptr<Gate> m_gate;
};

