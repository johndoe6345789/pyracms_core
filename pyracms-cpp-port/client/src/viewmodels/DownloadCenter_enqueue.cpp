#include "viewmodels/DownloadCenter.h"
#include "models/Constants.h"
#include "services/InstallPlanner.h"
#include "services/InstallRunner.h"
#include "domain/Format.h"

#include <QTimer>

namespace Hypernucleus {

void DownloadCenter::enqueue(const QString& name, const QString& version)
{
    if (isQueued(name)) return;
    if (busy()) {
        m_queue.append({name, version});
        emit queueChanged();
        emit gameStateChanged(name, GameStates::Queued, 0.0, tr("Queued"));
        return;
    }
    start({name, version});
}

void DownloadCenter::start(const Job& job)
{
    m_active = job.name;
    m_activeVersion = job.version;
    m_cancelled = false;
    m_progress = -1.0;
    m_label = tr("Preparing %1").arg(job.name);
    m_stepText = tr("Resolving dependencies");
    m_speed.clear();
    m_size.clear();
    m_log.clear();
    emit logChanged();
    emit changed();
    emit gameStateChanged(job.name, GameStates::Downloading, 0.0,
                          tr("Preparing..."));
    m_planner->plan(job.name, job.version);
}

void DownloadCenter::finishJob()
{
    m_active.clear();
    m_label.clear();
    m_stepText.clear();
    m_speed.clear();
    m_size.clear();
    m_progress = 0.0;
    emit changed();
    if (!m_queue.isEmpty()) {
        const Job next = m_queue.takeFirst();
        emit queueChanged();
        QTimer::singleShot(0, this, [this, next]() { start(next); });
    }
}

void DownloadCenter::fail(const QString& error)
{
    const QString name = m_active;
    finishJob();
    emit gameFailed(name, error);
}

} // namespace Hypernucleus
