#include "services/TimedSecretStore.h"

namespace Hypernucleus {

bool TimedSecretStore::write(const QString& service, const QString& account,
                             const QString& secret)
{
    auto inner = m_inner;
    const auto r = run([=](Result& out) {
        out.ok = inner->write(service, account, secret);
    });
    return r && r->ok;
}

QString TimedSecretStore::read(const QString& service, const QString& account)
{
    auto inner = m_inner;
    const auto r = run(
        [=](Result& out) { out.text = inner->read(service, account); });
    return r ? r->text : QString();
}

bool TimedSecretStore::remove(const QString& service, const QString& account)
{
    auto inner = m_inner;
    const auto r = run(
        [=](Result& out) { out.ok = inner->remove(service, account); });
    return r && r->ok;
}

} // namespace Hypernucleus
