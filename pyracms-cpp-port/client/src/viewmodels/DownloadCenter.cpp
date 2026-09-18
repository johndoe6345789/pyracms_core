#include "viewmodels/DownloadCenter.h"
#include "models/Constants.h"
#include "services/InstallPlanner.h"
#include "services/InstallRunner.h"
#include "domain/Format.h"

#include <QTimer>

namespace Hypernucleus {

DownloadCenter::DownloadCenter(InstallPlanner* planner, InstallRunner* runner,
                               QObject* parent)
    : QObject(parent), m_planner(planner), m_runner(runner)
{
    connect(m_planner, &InstallPlanner::planReady, this,
            [this](const InstallPlan& plan) {
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
            [this](const QString&, int phase, qint64 r, qint64 t) {
                onProgress(phase, r, t);
            });
    connect(m_runner, &InstallRunner::log, this,
            [this](const QString&, const QString& text) {
                m_log = (m_log + text).right(16 * 1024);
                emit logChanged();
            });
    connect(m_runner, &InstallRunner::finished, this,
            [this](const QString& root) {
                const QString version = m_activeVersion;
                finishJob();
                emit gameFinished(root, version);
            });
    connect(m_runner, &InstallRunner::failed, this,
            [this](const QString&, const QString& error) { fail(error); });
    connect(m_runner, &InstallRunner::cancelled, this,
            [this](const QString& root) {
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

} // namespace Hypernucleus
