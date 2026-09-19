#include "services/SecretStore.h"

#ifdef Q_OS_MACOS
#include <CoreFoundation/CoreFoundation.h>
#include <Security/Security.h>

namespace Hypernucleus {
namespace {

// Owns one CoreFoundation object.
struct Cf {
    explicit Cf(CFTypeRef r = nullptr) : ref(r) {}
    ~Cf()
    {
        if (ref) CFRelease(ref);
    }
    Cf(const Cf&) = delete;
    Cf& operator=(const Cf&) = delete;
    CFTypeRef ref;
};

CFStringRef str(const QString& s)
{
    const QByteArray u = s.toUtf8();
    return CFStringCreateWithBytes(
        kCFAllocatorDefault, reinterpret_cast<const UInt8*>(u.constData()),
        u.size(), kCFStringEncodingUTF8, false);
}

// Generic-password query for one (service, account) item.
CFMutableDictionaryRef query(CFStringRef service, CFStringRef account)
{
    CFMutableDictionaryRef q = CFDictionaryCreateMutable(
        kCFAllocatorDefault, 0, &kCFTypeDictionaryKeyCallBacks,
        &kCFTypeDictionaryValueCallBacks);
    CFDictionarySetValue(q, kSecClass, kSecClassGenericPassword);
    CFDictionarySetValue(q, kSecAttrService, service);
    CFDictionarySetValue(q, kSecAttrAccount, account);
    return q;
}

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
        return SecItemAdd(CFDictionaryRef(q.ref), nullptr) == errSecSuccess;
    }

    QString read(const QString& service, const QString& account) override
    {
        Cf s(str(service)), a(str(account));
        Cf q(query(CFStringRef(s.ref), CFStringRef(a.ref)));
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
        Cf q(query(CFStringRef(s.ref), CFStringRef(a.ref)));
        return SecItemDelete(CFDictionaryRef(q.ref)) == errSecSuccess;
    }
};

} // namespace

std::unique_ptr<SecretStore> createNativeSecretStore()
{
    return std::make_unique<KeychainStore>();
}

} // namespace Hypernucleus
#endif
