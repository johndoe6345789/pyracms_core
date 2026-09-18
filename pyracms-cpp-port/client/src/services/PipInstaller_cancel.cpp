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

void PipInstaller::cancel()
{
    if (m_process && m_busy) {
        m_cancelled = true;
        m_process->kill();
    }
}

} // namespace Hypernucleus
