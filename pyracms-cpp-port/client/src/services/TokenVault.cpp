#include "services/TokenVault.h"

#include <QSettings>

namespace Hypernucleus {

TokenVault::TokenVault(std::unique_ptr<SecretStore> primary)
    : m_primary(std::move(primary))
{
    if (!m_primary) m_primary = std::make_unique<MemorySecretStore>();
}

QString TokenVault::backendName() const
{
    return m_sessionOnly ? m_memory.backendName() : m_primary->backendName();
}

bool TokenVault::save(const QString& token)
{
    if (m_primary->isAvailable() &&
        m_primary->write(service(), account(), token)) {
        m_memory.remove(service(), account());
        m_sessionOnly = false;
        return true;
    }
    m_memory.write(service(), account(), token);
    m_sessionOnly = true;
    return false;
}

QString TokenVault::load()
{
    if (m_primary->isAvailable()) {
        const QString t = m_primary->read(service(), account());
        if (!t.isEmpty()) return t;
    }
    return m_memory.read(service(), account());
}

void TokenVault::clear()
{
    if (m_primary->isAvailable()) m_primary->remove(service(), account());
    m_memory.remove(service(), account());
}

bool TokenVault::migrateFromSettings(QSettings& settings)
{
    const QString plain = settings.value("auth/token").toString();
    if (plain.isEmpty()) return false;
    save(plain); // keychain, or memory when there is none
    settings.remove("auth/token");
    settings.sync();
    return true;
}

} // namespace Hypernucleus
