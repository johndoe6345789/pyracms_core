#include "services/InstallRunner.h"
#include "services/ModuleInstaller.h"
#include "services/PipInstaller.h"

namespace Hypernucleus {

bool InstallRunner::concerns(const QString& name) const
{
    if (m_index < 0 || m_index >= m_plan.steps.size()) return false;
    return m_plan.steps.at(m_index).name == name;
}

void InstallRunner::run(const InstallPlan& plan)
{
    if (m_running) {
        emit failed(plan.rootName, tr("Another installation is already running"));
        return;
    }
    m_plan = plan;
    m_index = -1;
    m_running = true;
    m_cancelRequested = false;
    next();
}

void InstallRunner::cancel()
{
    if (!m_running) return;
    m_cancelRequested = true;
    if (m_index >= 0 && m_index < m_plan.steps.size()) {
        if (m_plan.steps.at(m_index).kind == PlanStep::Kind::Pip)
            m_pip->cancel();
        else
            m_installer->cancel();
    }
}

void InstallRunner::finishWith(bool ok, const QString& error, bool wasCancelled)
{
    const QString root = m_plan.rootName;
    m_running = false;
    m_index = -1;
    if (ok)
        emit finished(root);
    else if (wasCancelled)
        emit cancelled(root);
    else
        emit failed(root, error);
}

void InstallRunner::next()
{
    if (m_cancelRequested) {
        finishWith(false, QString(), true);
        return;
    }
    ++m_index;
    if (m_index >= m_plan.steps.size()) {
        finishWith(true, QString());
        return;
    }
    const PlanStep step = m_plan.steps.at(m_index);
    emit stepChanged(m_plan.rootName, m_index, m_plan.steps.size(),
                     step.label());

    if (step.kind == PlanStep::Kind::Pip) {
        const QString dir = m_installer->installPath(step.name);
        m_pip->install(step.name, dir, step.pipSpecs);
    } else {
        m_installer->install(step.name, step.version, step.target.toJson(),
                             step.type);
    }
}

} // namespace Hypernucleus
