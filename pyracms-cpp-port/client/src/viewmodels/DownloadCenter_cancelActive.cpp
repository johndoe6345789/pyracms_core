#include "viewmodels/DownloadCenter.h"
#include "models/Constants.h"
#include "services/InstallPlanner.h"
#include "services/InstallRunner.h"
#include "domain/Format.h"

#include <QTimer>

namespace Hypernucleus {

void DownloadCenter::cancelActive()
{
    if (!busy()) return;
    if (m_external) {
        emit externalCancelRequested();
        return;
    }
    m_cancelled = true;
    if (m_planner->isPlanning()) {
        const QString name = m_active;
        m_planner->abort();
        finishJob();
        emit gameCancelled(name);
    } else if (m_runner->isRunning()) {
        m_runner->cancel();
    }
}

void DownloadCenter::removeQueued(const QString& name)
{
    for (int i = 0; i < m_queue.size(); ++i) {
        if (m_queue.at(i).name == name) {
            m_queue.removeAt(i);
            emit queueChanged();
            emit gameCancelled(name);
            return;
        }
    }
}

} // namespace Hypernucleus
