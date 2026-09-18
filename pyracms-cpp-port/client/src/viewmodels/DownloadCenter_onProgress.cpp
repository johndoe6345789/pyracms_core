#include "viewmodels/DownloadCenter.h"
#include "models/Constants.h"
#include "services/InstallPlanner.h"
#include "services/InstallRunner.h"
#include "domain/Format.h"

#include <QTimer>

namespace Hypernucleus {

void DownloadCenter::onProgress(int phase, qint64 received, qint64 total)
{
    const QString name = m_active;
    if (name.isEmpty()) return;

    switch (static_cast<InstallRunner::Phase>(phase)) {
    case InstallRunner::Phase::Download: {
        m_progress = total > 0 ? static_cast<double>(received) /
                                     static_cast<double>(total)
                               : -1.0;
        const qint64 now = m_clock.elapsed();
        if (m_lastMs == 0 || now - m_lastMs >= 500) {
            if (m_lastMs > 0 && now > m_lastMs) {
                const double inst =
                    static_cast<double>(received - m_lastBytes) * 1000.0 /
                    static_cast<double>(now - m_lastMs);
                m_smoothed =
                    m_smoothed <= 0 ? inst : m_smoothed * 0.6 + inst * 0.4;
                m_speed = Format::speed(m_smoothed);
            }
            m_lastBytes = received;
            m_lastMs = now;
        }
        m_size = total > 0
                     ? tr("%1 of %2")
                           .arg(Format::bytes(received), Format::bytes(total))
                     : Format::bytes(received);
        m_label = tr("Downloading %1").arg(m_stepLabel);
        const int pct =
            m_progress >= 0 ? static_cast<int>(m_progress * 100) : 0;
        emit changed();
        emit gameStateChanged(name, GameStates::Downloading, m_progress,
                              m_progress >= 0 ? tr("Downloading %1%").arg(pct)
                                              : tr("Downloading"));
        break;
    }
    case InstallRunner::Phase::Verify:
        m_progress = -1.0;
        m_label = tr("Verifying %1").arg(m_stepLabel);
        m_speed.clear();
        emit changed();
        emit gameStateChanged(name, GameStates::Verifying, -1.0,
                              tr("Verifying"));
        break;
    case InstallRunner::Phase::Extract:
        m_progress = -1.0;
        m_label = tr("Installing %1").arg(m_stepLabel);
        m_speed.clear();
        emit changed();
        emit gameStateChanged(name, GameStates::Installing, -1.0,
                              tr("Installing"));
        break;
    case InstallRunner::Phase::Pip:
        m_progress = -1.0;
        m_label = tr("Installing Python packages for %1").arg(name);
        m_speed.clear();
        emit changed();
        emit gameStateChanged(name, GameStates::Installing, -1.0,
                              tr("Installing packages"));
        break;
    }
}

} // namespace Hypernucleus
