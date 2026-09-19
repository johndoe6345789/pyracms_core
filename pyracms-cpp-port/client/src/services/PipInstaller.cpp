#include "services/PipInstaller.h"
#include "services/PathManager.h"

#include <QRegularExpression>

namespace Hypernucleus {

PipInstaller::PipInstaller(PathManager* paths, QObject* parent)
    : QObject(parent), m_paths(paths)
{
    setRunner(new QProcessRunner(this));
}

void PipInstaller::setRunner(ProcessRunner* runner)
{
    if (m_runner) m_runner->disconnect(this);
    m_runner = runner;
    connect(m_runner, &ProcessRunner::output, this,
            [this](const QString& text) { emit output(m_name, text); });
    connect(m_runner, &ProcessRunner::finished, this,
            [this](const ProcessResult& r) { onResult(r); });
}

bool PipInstaller::isBusy() const { return m_busy; }

void PipInstaller::setBusy(bool busy)
{
    if (m_busy == busy) return;
    m_busy = busy;
    emit busyChanged();
}

bool PipInstaller::isValidSpec(const QString& spec)
{
    static const QRegularExpression re(QString::fromLatin1(
        R"(^[A-Za-z0-9][A-Za-z0-9._-]*(\[[A-Za-z0-9,._-]+\])?\s*)"
        R"(((===|==|>=|<=|~=|!=|>|<)\s*[A-Za-z0-9.*+!_-]+)"
        R"((\s*,\s*(===|==|>=|<=|~=|!=|>|<)\s*[A-Za-z0-9.*+!_-]+)*)?$)"));
    return re.match(spec.trimmed()).hasMatch();
}

QStringList PipInstaller::buildArguments(const QString& requirementsFile,
                                         const QStringList& specs)
{
    QStringList args{"-m", "pip", "install", "--disable-pip-version-check",
                     "--no-input", "--upgrade"};
    if (!requirementsFile.isEmpty()) args << "-r" << requirementsFile;
    args << specs;
    return args;
}

QStringList PipInstaller::venvArguments(const QString& venvDir)
{
    return {"-m", "venv", venvDir};
}

} // namespace Hypernucleus
