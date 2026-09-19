#pragma once

#include <QString>
#include <memory>

#include "services/SecretStore.h"

class QSettings;

namespace Hypernucleus {

// Keeps the login token in the OS keychain. When no keychain works the
// token lives in memory for this session only: it is never written to disk
// in plain text, and sessionOnly() tells the UI to warn the user.
class TokenVault {
public:
    static QString service() { return QStringLiteral("Hypernucleus"); }
    static QString account() { return QStringLiteral("login-token"); }

    explicit TokenVault(std::unique_ptr<SecretStore> primary);

    // One-time migration: a plaintext "auth/token" left in QSettings by an
    // older version is moved into the store and deleted. True if one moved.
    bool migrateFromSettings(QSettings& settings);

    // False = the keychain refused, the token is now session only.
    bool save(const QString& token);
    QString load();
    void clear();

    bool sessionOnly() const { return m_sessionOnly; }
    QString backendName() const;

private:
    std::unique_ptr<SecretStore> m_primary;
    MemorySecretStore m_memory;
    bool m_sessionOnly = false;
};

} // namespace Hypernucleus
