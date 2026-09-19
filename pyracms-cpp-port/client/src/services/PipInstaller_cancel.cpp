#include "services/PipInstaller.h"

namespace Hypernucleus {

void PipInstaller::cancel()
{
    if (m_busy && m_runner->isRunning()) m_runner->cancel();
}

} // namespace Hypernucleus
