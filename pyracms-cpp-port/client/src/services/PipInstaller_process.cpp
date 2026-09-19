#include "services/PipInstaller.h"
#include "services/PathManager.h"

#include <QFileInfo>

namespace Hypernucleus {

void PipInstaller::end()
{
    m_stage = Stage::Idle;
    setBusy(false);
}

void PipInstaller::onResult(const ProcessResult& r)
{
    const QString name = m_name;
    const Stage stage = m_stage;
    const QString last = r.output.split('\n').last();
    const QString detail = last.isEmpty() ? QString() : ": " + last;
    if (r.cancelled) {
        end();
        emit cancelled(name);
    } else if (!r.started) {
        end();
        emit failed(name, tr("Could not start Python"));
    } else if (r.exitCode != 0) {
        end();
        const QString what = stage == Stage::Venv
                                 ? tr("Could not create the Python environment")
                                 : tr("pip failed");
        emit failed(name, tr("%1 (exit %2)").arg(what).arg(r.exitCode) +
                              detail);
    } else if (stage == Stage::Venv) {
        if (QFileInfo::exists(m_paths->venvPython(name))) {
            runPip();
        } else {
            end();
            emit failed(name, tr("The virtual environment has no interpreter"));
        }
    } else {
        end();
        emit finished(name);
    }
}

} // namespace Hypernucleus
