#pragma once

#include <condition_variable>
#include <functional>
#include <memory>
#include <mutex>

#include "services/SecretStore.h"

namespace Hypernucleus {

// Runs every call of `inner` on a worker thread and gives up after
// `timeoutMs`: a keychain that blocks (locked, waiting for a prompt nobody
// can answer) then reads as "unavailable" instead of hanging the launcher.
// After a timeout isAvailable() is false, so later calls fail at once.
class TimedSecretStore : public SecretStore {
public:
    TimedSecretStore(std::shared_ptr<SecretStore> inner, int timeoutMs);
    QString backendName() const override;
    bool isAvailable() const override;
    bool write(const QString& service, const QString& account,
               const QString& secret) override;
    QString read(const QString& service, const QString& account) override;
    bool remove(const QString& service, const QString& account) override;

private:
    // Shared with the worker, which may outlive the call (and this object).
    struct Result {
        std::mutex mutex;
        std::condition_variable done;
        bool finished = false;
        bool ok = false;
        QString text;
    };
    std::shared_ptr<Result> run(std::function<void(Result&)> job);

    std::shared_ptr<SecretStore> m_inner;
    int m_timeoutMs;
    bool m_hung = false;
};

} // namespace Hypernucleus
