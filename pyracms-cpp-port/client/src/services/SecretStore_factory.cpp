#include "services/SecretStore.h"

#include <QtGlobal>

namespace Hypernucleus {

std::unique_ptr<SecretStore> createPlatformSecretStore()
{
    if (qEnvironmentVariableIsSet("HYPERNUCLEUS_HOME"))
        return std::make_unique<MemorySecretStore>();
#if defined(Q_OS_WIN) || defined(Q_OS_MACOS)
    return createNativeSecretStore();
#else
    return createLibsecretStore();
#endif
}

#if !defined(Q_OS_WIN) && !defined(Q_OS_MACOS)
std::unique_ptr<SecretStore> createNativeSecretStore() { return nullptr; }
#endif

} // namespace Hypernucleus
