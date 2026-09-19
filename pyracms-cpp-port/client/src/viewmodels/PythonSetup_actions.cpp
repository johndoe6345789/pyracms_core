#include "viewmodels/PythonSetup.h"
#include "services/GameManager.h"
#include "services/PythonProvisioner.h"
#include "viewmodels/DownloadCenter.h"

namespace Hypernucleus {

void PythonSetup::accept()
{
    if (!m_prompt) return;
    m_prompt = false;
    m_dl->beginExternal(
        tr("Downloading Python %1").arg(m_prov->offer().version));
    m_prov->accept();
    emit changed();
}

void PythonSetup::decline()
{
    m_prompt = false;
    m_prov->decline();
    emit changed();
}

void PythonSetup::onInstalled(const QString&)
{
    m_dl->endExternal();
    emit notice(tr("Python is ready."), false);
    emit changed();
    if (m_then == Then::Install)
        m_dl->enqueue(m_game, QString());
    else
        m_games->launchGame(m_game);
}

void PythonSetup::onEnded(const QString& text, bool error)
{
    m_prompt = false;
    m_dl->endExternal();
    if (!text.isEmpty()) emit notice(text, error);
    emit changed();
}

} // namespace Hypernucleus
