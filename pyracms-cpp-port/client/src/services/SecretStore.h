#pragma once

#include <QMap>
#include <QString>
#include <memory>

namespace Hypernucleus {

// Where secrets (the login token) live: the OS keychain. Implementations
// never write plaintext to disk. All calls are synchronous and short.
class SecretStore {
public:
    virtual ~SecretStore() = default;
    virtual QString backendName() const = 0;
    // False when there is no usable keychain (write() would fail).
    virtual bool isAvailable() const = 0;
    virtual bool write(const QString& service, const QString& account,
                       const QString& secret) = 0;
    // Empty string when there is no such secret.
    virtual QString read(const QString& service, const QString& account) = 0;
    virtual bool remove(const QString& service, const QString& account) = 0;
};

// Session-only store (also the test fake): nothing leaves the process.
class MemorySecretStore : public SecretStore {
public:
    QString backendName() const override { return "memory"; }
    bool isAvailable() const override { return true; }
    bool write(const QString& service, const QString& account,
               const QString& secret) override;
    QString read(const QString& service, const QString& account) override;
    bool remove(const QString& service, const QString& account) override;

private:
    QMap<QString, QString> m_items;
};

// Windows Credential Manager, macOS Keychain, Linux Secret Service
// (libsecret's `secret-tool`). Portable mode (HYPERNUCLEUS_HOME set) keeps
// everything in one folder, so it uses the session-only store.
std::unique_ptr<SecretStore> createPlatformSecretStore();

// Windows / macOS store (nullptr elsewhere), exposed for the real tests.
std::unique_ptr<SecretStore> createNativeSecretStore();
// Linux Secret Service through `secret-tool` (empty = look it up on PATH).
std::unique_ptr<SecretStore>
createLibsecretStore(const QString& secretToolPath = QString());

} // namespace Hypernucleus
