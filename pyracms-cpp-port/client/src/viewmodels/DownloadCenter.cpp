#include "viewmodels/DownloadCenter.h"
#include "models/Constants.h"
#include "services/InstallPlanner.h"
#include "services/InstallRunner.h"
#include "domain/Format.h"

#include <QTimer>

namespace Hypernucleus {

DownloadCenter::DownloadCenter(InstallPlanner* planner, InstallRunner* runner,
                               QObject* parent)
    : QObject(parent)
    , m_planner(planner)
    , m_runner(runner)
{
    connect(m_planner, &InstallPlanner::planReady, this, [this](const InstallPlan& plan) {
        if (m_cancelled) {
            finishJob();
            emit gameCancelled(plan.rootName);
            return;
        }
        m_activeVersion = plan.rootVersion;
        m_runner->run(plan);
    });
    connect(m_planner, &InstallPlanner::planFailed, this,
            [this](const QString&, const QString& error) { fail(error); });

    connect(m_runner, &InstallRunner::stepChanged, this,
            [this](const QString&, int index, int count, const QString& label) {
        m_stepText = tr("Step %1 of %2").arg(index + 1).arg(count);
        m_stepLabel = label;
        m_lastBytes = 0;
        m_lastMs = 0;
        m_smoothed = 0.0;
        m_clock.restart();
        m_speed.clear();
        m_size.clear();
        m_label = tr("Preparing %1").arg(label);
        emit changed();
    });
    connect(m_runner, &InstallRunner::progress, this,
            [this](const QString&, int phase, qint64 r, qint64 t) { onProgress(phase, r, t); });
    connect(m_runner, &InstallRunner::log, this, [this](const QString&, const QString& text) {
        m_log = (m_log + text).right(16 * 1024);
        emit logChanged();
    });
    connect(m_runner, &InstallRunner::finished, this, [this](const QString& root) {
        const QString version = m_activeVersion;
        finishJob();
        emit gameFinished(root, version);
    });
    connect(m_runner, &InstallRunner::failed, this,
            [this](const QString&, const QString& error) { fail(error); });
    connect(m_runner, &InstallRunner::cancelled, this, [this](const QString& root) {
        finishJob();
        emit gameCancelled(root);
    });
}

QStringList DownloadCenter::queue() const
{
    QStringList names;
    for (const Job& j : m_queue)
        names << j.name;
    return names;
}

bool DownloadCenter::isQueued(const QString& name) const
{
    return m_active == name || queue().contains(name);
}

void DownloadCenter::enqueue(const QString& name, const QString& version)
{
    if (isQueued(name))
        return;
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
    emit gameStateChanged(job.name, GameStates::Downloading, 0.0, tr("Preparing..."));
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

void DownloadCenter::cancelActive()
{
    if (!busy())
        return;
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

void DownloadCenter::onProgress(int phase, qint64 received, qint64 total)
{
    const QString name = m_active;
    if (name.isEmpty())
        return;

    switch (static_cast<InstallRunner::Phase>(phase)) {
    case InstallRunner::Phase::Download: {
        m_progress = total > 0 ? static_cast<double>(received) / static_cast<double>(total) : -1.0;
        const qint64 now = m_clock.elapsed();
        if (m_lastMs == 0 || now - m_lastMs >= 500) {
            if (m_lastMs > 0 && now > m_lastMs) {
                const double inst = static_cast<double>(received - m_lastBytes) * 1000.0
                                    / static_cast<double>(now - m_lastMs);
                m_smoothed = m_smoothed <= 0 ? inst : m_smoothed * 0.6 + inst * 0.4;
                m_speed = Format::speed(m_smoothed);
            }
            m_lastBytes = received;
            m_lastMs = now;
        }
        m_size = total > 0 ? tr("%1 of %2").arg(Format::bytes(received), Format::bytes(total))
                           : Format::bytes(received);
        m_label = tr("Downloading %1").arg(m_stepLabel);
        const int pct = m_progress >= 0 ? static_cast<int>(m_progress * 100) : 0;
        emit changed();
        emit gameStateChanged(name, GameStates::Downloading, m_progress,
                              m_progress >= 0 ? tr("Downloading %1%").arg(pct) : tr("Downloading"));
        break;
    }
    case InstallRunner::Phase::Verify:
        m_progress = -1.0;
        m_label = tr("Verifying %1").arg(m_stepLabel);
        m_speed.clear();
        emit changed();
        emit gameStateChanged(name, GameStates::Verifying, -1.0, tr("Verifying"));
        break;
    case InstallRunner::Phase::Extract:
        m_progress = -1.0;
        m_label = tr("Installing %1").arg(m_stepLabel);
        m_speed.clear();
        emit changed();
        emit gameStateChanged(name, GameStates::Installing, -1.0, tr("Installing"));
        break;
    case InstallRunner::Phase::Pip:
        m_progress = -1.0;
        m_label = tr("Installing Python packages for %1").arg(name);
        m_speed.clear();
        emit changed();
        emit gameStateChanged(name, GameStates::Installing, -1.0, tr("Installing packages"));
        break;
    }
}

} // namespace Hypernucleus
