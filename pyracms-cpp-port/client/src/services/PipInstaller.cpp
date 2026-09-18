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
    : QObject(parent)
    , m_paths(paths)
{
}

bool PipInstaller::isBusy() const
{
    return m_busy;
}

void PipInstaller::setBusy(bool busy)
{
    if (m_busy == busy)
        return;
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
    QStringList args{"-m", "pip", "install", "--disable-pip-version-check",
                     "--no-input", "--upgrade", "--target", targetDir};
    if (!requirementsFile.isEmpty())
        args << "-r" << requirementsFile;
    args << specs;
    return args;
}

void PipInstaller::install(const QString& gameName, const QString& gameDir,
                           const QStringList& specs)
{
    if (m_busy) {
        emit failed(gameName, "pip is already running");
        return;
    }
    QString requirements = gameDir + "/requirements.txt";
    if (!QFileInfo::exists(requirements))
        requirements.clear();
    QStringList cleanSpecs;
    for (const QString& s : specs)
        if (isValidSpec(s))
            cleanSpecs << s.trimmed();

    if (requirements.isEmpty() && cleanSpecs.isEmpty()) {
        QTimer::singleShot(0, this, [this, gameName]() { emit finished(gameName); });
        return;
    }

    const PythonInfo py = PythonLocator::find(m_pythonPath, m_paths->dataDir());
    if (!py.found()) {
        emit failed(gameName, "Python was not found. Install Python 3 or set its "
                              "location in Settings to install pip packages.");
        return;
    }

    const QString target = m_paths->pipTargetDir(gameName);
    QDir().mkpath(target);

    m_name = gameName;
    m_tail.clear();
    m_cancelled = false;
    setBusy(true);
    emit started(gameName);

    m_process = new QProcess(this);
    m_process->setProcessChannelMode(QProcess::MergedChannels);
    QProcessEnvironment env = QProcessEnvironment::systemEnvironment();
    env.insert("PIP_DISABLE_PIP_VERSION_CHECK", "1");
    env.insert("PYTHONUNBUFFERED", "1");
    m_process->setProcessEnvironment(env);

    connect(m_process, &QProcess::readyReadStandardOutput, this, [this]() {
        const QString text = QString::fromUtf8(m_process->readAllStandardOutput());
        m_tail = (m_tail + text).right(2000);
        emit output(m_name, text);
    });
    connect(m_process, &QProcess::errorOccurred, this,
            [this](QProcess::ProcessError e) {
        if (e != QProcess::FailedToStart)
            return;
        const QString name = m_name;
        m_process->deleteLater();
        m_process = nullptr;
        setBusy(false);
        emit failed(name, "Could not start Python: " + QString::number(e));
    });
    connect(m_process, QOverload<int, QProcess::ExitStatus>::of(&QProcess::finished),
            this, [this](int code, QProcess::ExitStatus status) {
        const QString name = m_name;
        const QString tail = m_tail.trimmed();
        m_process->deleteLater();
        m_process = nullptr;
        setBusy(false);
        if (m_cancelled) {
            emit cancelled(name);
        } else if (status == QProcess::NormalExit && code == 0) {
            emit finished(name);
        } else {
            emit failed(name, "pip failed (exit " + QString::number(code) + ")"
                              + (tail.isEmpty() ? QString() : ": " + tail.split('\n').last()));
        }
    });

    m_process->setProgram(py.exe);
    m_process->setArguments(py.prefix + buildArguments(target, requirements, cleanSpecs));
    m_process->setWorkingDirectory(gameDir);
    m_process->start();
}

void PipInstaller::cancel()
{
    if (m_process && m_busy) {
        m_cancelled = true;
        m_process->kill();
    }
}

} // namespace Hypernucleus
