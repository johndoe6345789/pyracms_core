#include "services/InstallRunner.h"
#include "services/ModuleInstaller.h"
#include "services/PipInstaller.h"

namespace Hypernucleus {

InstallRunner::InstallRunner(ModuleInstaller* installer, PipInstaller* pip,
                             QObject* parent)
    : QObject(parent)
    , m_installer(installer)
    , m_pip(pip)
{
    connect(m_installer, &ModuleInstaller::downloadProgress, this,
            [this](const QString& n, qint64 r, qint64 t) {
        if (m_running && concerns(n))
            emit progress(m_plan.rootName, static_cast<int>(Phase::Download), r, t);
    });
    connect(m_installer, &ModuleInstaller::verifyStarted, this, [this](const QString& n) {
        if (m_running && concerns(n))
            emit progress(m_plan.rootName, static_cast<int>(Phase::Verify), 0, 0);
    });
    connect(m_installer, &ModuleInstaller::extractionStarted, this, [this](const QString& n) {
        if (m_running && concerns(n))
            emit progress(m_plan.rootName, static_cast<int>(Phase::Extract), 0, 0);
    });
    connect(m_installer, &ModuleInstaller::installComplete, this,
            [this](const QString& n, const QString&) {
        if (!m_running || m_index < 0 || m_index >= m_plan.steps.size())
            return;
        const PlanStep& step = m_plan.steps.at(m_index);
        if (step.kind != PlanStep::Kind::Module || step.name != n)
            return;
        if (step.type == "game")
            m_installer->annotate(n, m_plan.depNames, m_plan.pipSpecs);
        next();
    });
    connect(m_installer, &ModuleInstaller::installFailed, this,
            [this](const QString& n, const QString& err) {
        if (m_running && concerns(n))
            finishWith(false, n + ": " + err);
    });
    connect(m_installer, &ModuleInstaller::installCancelled, this,
            [this](const QString& n) {
        if (m_running && concerns(n))
            finishWith(false, QString(), true);
    });

    connect(m_pip, &PipInstaller::started, this, [this](const QString& n) {
        if (m_running && concerns(n))
            emit progress(m_plan.rootName, static_cast<int>(Phase::Pip), 0, 0);
    });
    connect(m_pip, &PipInstaller::output, this, [this](const QString& n, const QString& t) {
        if (m_running && concerns(n))
            emit log(m_plan.rootName, t);
    });
    connect(m_pip, &PipInstaller::finished, this, [this](const QString& n) {
        if (!m_running || m_index < 0 || m_index >= m_plan.steps.size())
            return;
        const PlanStep& step = m_plan.steps.at(m_index);
        if (step.kind == PlanStep::Kind::Pip && step.name == n)
            next();
    });
    connect(m_pip, &PipInstaller::failed, this, [this](const QString& n, const QString& err) {
        if (m_running && concerns(n))
            finishWith(false, err);
    });
    connect(m_pip, &PipInstaller::cancelled, this, [this](const QString& n) {
        if (m_running && concerns(n))
            finishWith(false, QString(), true);
    });
}

bool InstallRunner::concerns(const QString& name) const
{
    if (m_index < 0 || m_index >= m_plan.steps.size())
        return false;
    return m_plan.steps.at(m_index).name == name;
}

void InstallRunner::run(const InstallPlan& plan)
{
    if (m_running) {
        emit failed(plan.rootName, "Another installation is already running");
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
    if (!m_running)
        return;
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
    emit stepChanged(m_plan.rootName, m_index, m_plan.steps.size(), step.label());

    if (step.kind == PlanStep::Kind::Pip) {
        const QString dir = m_installer->installPath(step.name);
        m_pip->install(step.name, dir, step.pipSpecs);
    } else {
        m_installer->install(step.name, step.version, step.target.toJson(), step.type);
    }
}

} // namespace Hypernucleus
