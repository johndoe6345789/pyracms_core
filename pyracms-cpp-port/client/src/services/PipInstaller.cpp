#include "services/PipInstaller.h"
#include "services/PathManager.h"
#include "services/PythonLocator.h"

#include <QDir>
#include <QFileInfo>
#include <QProcess>
#include <QProcessEnvironment>
#include <QRegularExpression>
#include <QTimer>

namespace Hypernucleus {

PipInstaller::PipInstaller(PathManager* paths, QObject* parent)
    : QObject(parent), m_paths(paths)
{
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

QStringList PipInstaller::buildArguments(const QString& targetDir,
                                         const QString& requirementsFile,
                                         const QStringList& specs)
{
    QStringList args{
        "-m",         "pip",       "install",  "--disable-pip-version-check",
        "--no-input", "--upgrade", "--target", targetDir};
    if (!requirementsFile.isEmpty()) args << "-r" << requirementsFile;
    args << specs;
    return args;
}

} // namespace Hypernucleus
