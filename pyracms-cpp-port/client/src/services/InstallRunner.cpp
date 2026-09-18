#include "services/InstallRunner.h"
#include "services/ModuleInstaller.h"
#include "services/PipInstaller.h"

namespace Hypernucleus {

InstallRunner::InstallRunner(ModuleInstaller* installer, PipInstaller* pip,
                             QObject* parent)
    : QObject(parent), m_installer(installer), m_pip(pip)
{
    connect(m_installer, &ModuleInstaller::downloadProgress, this,
            [this](const QString& n, qint64 r, qint64 t) {
                if (m_running && concerns(n))
                    emit progress(m_plan.rootName,
                                  static_cast<int>(Phase::Download), r, t);
            });
    connect(m_installer, &ModuleInstaller::verifyStarted, this,
            [this](const QString& n) {
                if (m_running && concerns(n))
                    emit progress(m_plan.rootName,
                                  static_cast<int>(Phase::Verify), 0, 0);
            });
    connect(m_installer, &ModuleInstaller::extractionStarted, this,
            [this](const QString& n) {
                if (m_running && concerns(n))
                    emit progress(m_plan.rootName,
                                  static_cast<int>(Phase::Extract), 0, 0);
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
                if (m_running && concerns(n)) finishWith(false, n + ": " + err);
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
    connect(m_pip, &PipInstaller::output, this,
            [this](const QString& n, const QString& t) {
                if (m_running && concerns(n)) emit log(m_plan.rootName, t);
            });
    connect(m_pip, &PipInstaller::finished, this, [this](const QString& n) {
        if (!m_running || m_index < 0 || m_index >= m_plan.steps.size()) return;
        const PlanStep& step = m_plan.steps.at(m_index);
        if (step.kind == PlanStep::Kind::Pip && step.name == n) next();
    });
    connect(m_pip, &PipInstaller::failed, this,
            [this](const QString& n, const QString& err) {
                if (m_running && concerns(n)) finishWith(false, err);
            });
    connect(m_pip, &PipInstaller::cancelled, this, [this](const QString& n) {
        if (m_running && concerns(n)) finishWith(false, QString(), true);
    });
}

} // namespace Hypernucleus
