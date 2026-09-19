#include "services/PythonProvisioner.h"
#include "services/DownloadManager.h"

namespace Hypernucleus {

void PythonProvisioner::setPlatform(const QString& os, const QString& arch)
{
    m_os = os;
    m_arch = arch;
}

void PythonProvisioner::setState(State s)
{
    if (m_state == s) return;
    m_state = s;
    emit stateChanged();
}

void PythonProvisioner::fail(const QString& error)
{
    setState(State::Idle);
    emit failed(error);
}

void PythonProvisioner::decline()
{
    if (m_state != State::Offered) return;
    ++m_generation;
    setState(State::Idle);
}

void PythonProvisioner::cancel()
{
    if (m_state == State::Idle) return;
    ++m_generation;
    if (m_state == State::Downloading) {
        m_downloads->cancel("managed-python"); // reports through cancelled()
    } else if (m_state == State::Extracting) {
        m_tar->cancel();
    } else {
        setState(State::Idle);
        emit cancelled();
    }
}

} // namespace Hypernucleus
