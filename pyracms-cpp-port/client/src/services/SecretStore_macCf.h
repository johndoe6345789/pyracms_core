#pragma once

#include <CoreFoundation/CoreFoundation.h>
#include <Security/Security.h>

#include <QByteArray>
#include <QString>

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

// Generic-password query for one (service, account) item. `noUi` is for
// reads and deletes; it is not valid on SecItemAdd, where it can make the
// call fail outright.
CFMutableDictionaryRef query(CFStringRef service, CFStringRef account,
                             bool noUi = false)
{
    CFMutableDictionaryRef q = CFDictionaryCreateMutable(
        kCFAllocatorDefault, 0, &kCFTypeDictionaryKeyCallBacks,
        &kCFTypeDictionaryValueCallBacks);
    CFDictionarySetValue(q, kSecClass, kSecClassGenericPassword);
    CFDictionarySetValue(q, kSecAttrService, service);
    CFDictionarySetValue(q, kSecAttrAccount, account);
    if (noUi) {
        // Fail at once instead of showing an unlock / permission prompt.
        CFDictionarySetValue(q, kSecUseAuthenticationUI,
                             kSecUseAuthenticationUIFail);
    }
    return q;
}

} // namespace
} // namespace Hypernucleus
