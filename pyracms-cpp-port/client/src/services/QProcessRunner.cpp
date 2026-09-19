#include "services/ProcessRunner.h"

#include <QProcess>

namespace Hypernucleus {

bool QProcessRunner::isRunning() const { return m_process != nullptr; }

void QProcessRunner::start(const QString& program, const QStringList& args,
                           const QString& workDir,
                           const QProcessEnvironment& env)
{
    qRegisterMetaType<ProcessResult>();
    m_tail.clear();
    m_cancelled = false;
    m_process = new QProcess(this);
    m_process->setProcessChannelMode(QProcess::MergedChannels);
    m_process->setProcessEnvironment(env);
    connect(m_process, &QProcess::readyReadStandardOutput, this, [this]() {
        const QString text =
            QString::fromUtf8(m_process->readAllStandardOutput());
        m_tail = (m_tail + text).right(2000);
        emit output(text);
    });
    connect(m_process, &QProcess::errorOccurred, this,
            [this](QProcess::ProcessError e) {
                if (e == QProcess::FailedToStart) finish(false, -1);
            });
    connect(m_process,
            QOverload<int, QProcess::ExitStatus>::of(&QProcess::finished), this,
            [this](int code, QProcess::ExitStatus st) {
                finish(true, st == QProcess::NormalExit ? code : -1);
            });
    m_process->setWorkingDirectory(workDir);
    m_process->start(program, args);
}

void QProcessRunner::cancel()
{
    if (!m_process) return;
    m_cancelled = true;
    m_process->kill();
}

void QProcessRunner::finish(bool started, int code)
{
    if (!m_process) return;
    m_process->deleteLater();
    m_process = nullptr;
    ProcessResult r;
    r.started = started;
    r.exitCode = code;
    r.cancelled = m_cancelled;
    r.output = m_tail.trimmed();
    emit finished(r);
}

} // namespace Hypernucleus
