#include "services/PipInstaller.h"

#include <QProcess>
#include <QProcessEnvironment>

namespace Hypernucleus {

void PipInstaller::startProcess(const PythonInfo& py, const QStringList& args,
                                const QString& workDir)
{
    m_process = new QProcess(this);
    m_process->setProcessChannelMode(QProcess::MergedChannels);
    QProcessEnvironment env = QProcessEnvironment::systemEnvironment();
    env.insert("PIP_DISABLE_PIP_VERSION_CHECK", "1");
    env.insert("PYTHONUNBUFFERED", "1");
    m_process->setProcessEnvironment(env);
    connectProcess();
    m_process->setProgram(py.exe);
    m_process->setArguments(py.prefix + args);
    m_process->setWorkingDirectory(workDir);
    m_process->start();
}

void PipInstaller::connectProcess()
{
    connect(m_process, &QProcess::readyReadStandardOutput, this, [this]() {
        const QString text =
            QString::fromUtf8(m_process->readAllStandardOutput());
        m_tail = (m_tail + text).right(2000);
        emit output(m_name, text);
    });
    connect(m_process, &QProcess::errorOccurred, this,
            [this](QProcess::ProcessError e) {
                if (e != QProcess::FailedToStart) return;
                const QString name = m_name;
                m_process->deleteLater();
                m_process = nullptr;
                setBusy(false);
                emit failed(name,
                            "Could not start Python: " + QString::number(e));
            });
    connect(m_process,
            QOverload<int, QProcess::ExitStatus>::of(&QProcess::finished), this,
            [this](int code, QProcess::ExitStatus status) {
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
                    emit failed(
                        name,
                        "pip failed (exit " + QString::number(code) + ")" +
                            (tail.isEmpty() ? QString()
                                            : ": " + tail.split('\n').last()));
                }
            });
}

} // namespace Hypernucleus
