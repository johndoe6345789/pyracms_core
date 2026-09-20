#include "services/SecretStore.h"

#ifdef Q_OS_MACOS
#include "services/SecretStore_macCf.h"
#include "services/TimedSecretStore.h"

namespace Hypernucleus {
namespace {

// macOS Keychain (login keychain, generic password items).
class KeychainStore : public SecretStore {
public:
    QString backendName() const override { return "keychain"; }
    bool isAvailable() const override { return true; }

    bool write(const QString& service, const QString& account,
               const QString& secret) override
    {
        remove(service, account);
        Cf s(str(service)), a(str(account));
        const QByteArray u = secret.toUtf8();
        Cf data(CFDataCreate(kCFAllocatorDefault,
                             reinterpret_cast<const UInt8*>(u.constData()),
                             u.size()));
        Cf q(query(CFStringRef(s.ref), CFStringRef(a.ref)));
        CFDictionarySetValue(CFMutableDictionaryRef(q.ref), kSecValueData,
                             data.ref);
        // Pin the add to the default keychain and let any app read the
        // item: the implicit target/ACL can stall headless sessions.
        SecKeychainRef kc = nullptr;
        SecKeychainCopyDefault(&kc);
        Cf kcHold(kc);
        if (kc) CFDictionarySetValue(CFMutableDictionaryRef(q.ref),
                                     kSecUseKeychain, kc);
        Cf empty(CFArrayCreate(kCFAllocatorDefault, nullptr, 0,
                               &kCFTypeArrayCallBacks));
        SecAccessRef acc = nullptr;
        Cf label(str(service));
        SecAccessCreate(CFStringRef(label.ref), CFArrayRef(empty.ref),
                        &acc);
        Cf accHold(acc);
        if (acc) CFDictionarySetValue(CFMutableDictionaryRef(q.ref),
                                      kSecAttrAccess, acc);
        const OSStatus st = SecItemAdd(CFDictionaryRef(q.ref), nullptr);
        if (st != errSecSuccess)
            qWarning("Keychain add failed: OSStatus %d", int(st));
        return st == errSecSuccess;
    }

    QString read(const QString& service, const QString& account) override
    {
        Cf s(str(service)), a(str(account));
        Cf q(query(CFStringRef(s.ref), CFStringRef(a.ref), true));
        CFMutableDictionaryRef m = CFMutableDictionaryRef(q.ref);
        CFDictionarySetValue(m, kSecReturnData, kCFBooleanTrue);
        CFDictionarySetValue(m, kSecMatchLimit, kSecMatchLimitOne);
        CFTypeRef out = nullptr;
        if (SecItemCopyMatching(CFDictionaryRef(m), &out) != errSecSuccess)
            return QString();
        Cf hold(out);
        const CFDataRef d = CFDataRef(out);
        return QString::fromUtf8(
            reinterpret_cast<const char*>(CFDataGetBytePtr(d)),
            static_cast<qsizetype>(CFDataGetLength(d)));
    }

    bool remove(const QString& service, const QString& account) override
    {
        Cf s(str(service)), a(str(account));
        Cf q(query(CFStringRef(s.ref), CFStringRef(a.ref), true));
        return SecItemDelete(CFDictionaryRef(q.ref)) == errSecSuccess;
    }
};

} // namespace

std::unique_ptr<SecretStore> createNativeSecretStore()
{
    // A locked keychain must never hang the launcher: 5 s at most per call.
    return std::make_unique<TimedSecretStore>(
        std::make_shared<KeychainStore>(), 5000);
}

} // namespace Hypernucleus
#endif
