#include "viewmodels/PythonSetup.h"
#include "services/PythonProvisioner.h"
#include "viewmodels/DownloadCenter.h"

namespace Hypernucleus {

void PythonSetup::wire()
{
    connect(m_prov, &PythonProvisioner::offerReady, this,
            &PythonSetup::onOffer);
    connect(m_prov, &PythonProvisioner::progress, m_dl,
            [this](qint64 r, qint64 t) { m_dl->externalProgress(r, t); });
    connect(m_prov, &PythonProvisioner::installed, this,
            &PythonSetup::onInstalled);
    connect(m_prov, &PythonProvisioner::failed, this,
            [this](const QString& e) { onEnded(e, true); });
    connect(m_prov, &PythonProvisioner::cancelled, this,
            [this]() { onEnded(tr("Python download cancelled."), false); });
    connect(m_prov, &PythonProvisioner::stateChanged, this,
            &PythonSetup::changed);
    connect(m_dl, &DownloadCenter::externalCancelRequested, m_prov,
            &PythonProvisioner::cancel);
}

} // namespace Hypernucleus
