#include "services/SecretStore.h"

namespace Hypernucleus {

bool MemorySecretStore::write(const QString& service, const QString& account,
                              const QString& secret)
{
    m_items.insert(service + '\n' + account, secret);
    return true;
}

QString MemorySecretStore::read(const QString& service, const QString& account)
{
    return m_items.value(service + '\n' + account);
}

bool MemorySecretStore::remove(const QString& service, const QString& account)
{
    return m_items.remove(service + '\n' + account) > 0;
}

} // namespace Hypernucleus
