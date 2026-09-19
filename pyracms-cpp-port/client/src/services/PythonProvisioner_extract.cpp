#include "services/PythonProvisioner.h"
#include "services/ArchiveExtractor.h"
#include "services/PathManager.h"
#include "services/PythonLocator.h"

#include <QDir>
#include <QFile>
#include <QProcessEnvironment>

namespace Hypernucleus {

void PythonProvisioner::extract(const QString& archive)
{
    setState(State::Extracting);
    const QString data = m_paths->dataDir();
    const QString staging = data + "/python-staging";
    QDir(staging).removeRecursively();
    QDir().mkpath(staging);
    if (m_asset.isZip()) {
        const ExtractResult r = ArchiveExtractor::extractZip(archive, staging);
        ProcessResult pr;
        pr.started = true;
        pr.exitCode = r.ok ? 0 : 1;
        pr.output = r.error;
        finishExtract(staging, pr);
        return;
    }
    // Relative paths keep a "C:" out of tar's arguments (GNU tar on Windows).
    m_tar->start(tarProgram(),
                 {"-xzf", QDir(data).relativeFilePath(archive), "-C",
                  "python-staging"},
                 data, QProcessEnvironment::systemEnvironment());
}

void PythonProvisioner::finishExtract(const QString& staging,
                                      const ProcessResult& r)
{
    if (m_state != State::Extracting) return;
    const QString target = m_paths->dataDir() + "/python";
    if (r.cancelled) {
        QDir(staging).removeRecursively();
        setState(State::Idle);
        emit cancelled();
        return;
    }
    if (!r.ok()) {
        QDir(staging).removeRecursively();
        fail(tr("Could not unpack Python: %1").arg(r.output));
        return;
    }
    QDir(target).removeRecursively();
    QDir().rename(staging + "/python", target);
    QDir(staging).removeRecursively();
    QFile::remove(m_paths->archivePath(m_asset.name));
    const PythonInfo py = PythonLocator::find(QString(), m_paths->dataDir());
    if (!py.found() || !py.exe.startsWith(m_paths->dataDir())) {
        fail(tr("The Python archive did not contain an interpreter."));
        return;
    }
    setState(State::Idle);
    emit installed(py.exe);
}

} // namespace Hypernucleus
