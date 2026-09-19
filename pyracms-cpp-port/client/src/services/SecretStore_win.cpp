#include "services/SecretStore.h"

#ifdef Q_OS_WIN
#include <windows.h>
#include <wincred.h>

#include <string>

namespace Hypernucleus {
namespace {

std::wstring targetOf(const QString& service, const QString& account)
{
    return (service + '/' + account).toStdWString();
}

// Windows Credential Manager (generic credentials, per user).
class WinCredStore : public SecretStore {
public:
    QString backendName() const override { return "wincred"; }
    bool isAvailable() const override { return true; }

    bool write(const QString& service, const QString& account,
               const QString& secret) override
    {
        std::wstring target = targetOf(service, account);
        std::wstring user = account.toStdWString();
        QByteArray blob = secret.toUtf8();
        CREDENTIALW c = {};
        c.Type = CRED_TYPE_GENERIC;
        c.TargetName = const_cast<LPWSTR>(target.c_str());
        c.UserName = const_cast<LPWSTR>(user.c_str());
        c.CredentialBlobSize = static_cast<DWORD>(blob.size());
        c.CredentialBlob = reinterpret_cast<LPBYTE>(blob.data());
        c.Persist = CRED_PERSIST_LOCAL_MACHINE;
        return CredWriteW(&c, 0) == TRUE;
    }

    QString read(const QString& service, const QString& account) override
    {
        PCREDENTIALW cred = nullptr;
        const std::wstring target = targetOf(service, account);
        if (!CredReadW(target.c_str(), CRED_TYPE_GENERIC, 0, &cred))
            return QString();
        const QString out = QString::fromUtf8(
            reinterpret_cast<const char*>(cred->CredentialBlob),
            static_cast<qsizetype>(cred->CredentialBlobSize));
        CredFree(cred);
        return out;
    }

    bool remove(const QString& service, const QString& account) override
    {
        const std::wstring target = targetOf(service, account);
        return CredDeleteW(target.c_str(), CRED_TYPE_GENERIC, 0) == TRUE;
    }
};

} // namespace

std::unique_ptr<SecretStore> createNativeSecretStore()
{
    return std::make_unique<WinCredStore>();
}

} // namespace Hypernucleus
#endif
