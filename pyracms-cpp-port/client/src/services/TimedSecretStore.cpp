#include "services/TimedSecretStore.h"

#include <chrono>
#include <thread>

namespace Hypernucleus {

TimedSecretStore::TimedSecretStore(std::shared_ptr<SecretStore> inner,
                                   int timeoutMs)
    : m_inner(std::move(inner)), m_timeoutMs(timeoutMs)
{
}

QString TimedSecretStore::backendName() const
{
    return m_inner->backendName();
}

bool TimedSecretStore::isAvailable() const
{
    return !m_hung && m_inner->isAvailable();
}

std::shared_ptr<TimedSecretStore::Result>
TimedSecretStore::run(std::function<void(Result&)> job)
{
    auto res = std::make_shared<Result>();
    if (m_hung) return nullptr;
    std::thread([res, job]() {
        Result local;
        job(local);
        std::lock_guard<std::mutex> lock(res->mutex);
        res->ok = local.ok;
        res->text = local.text;
        res->finished = true;
        res->done.notify_all();
    }).detach();
    std::unique_lock<std::mutex> lock(res->mutex);
    const bool in_time = res->done.wait_for(
        lock, std::chrono::milliseconds(m_timeoutMs),
        [&res]() { return res->finished; });
    if (!in_time) {
        m_hung = true;
        return nullptr;
    }
    return res;
}

} // namespace Hypernucleus
