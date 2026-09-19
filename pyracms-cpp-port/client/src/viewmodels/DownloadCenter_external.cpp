#include "viewmodels/DownloadCenter.h"
#include "domain/Format.h"

namespace Hypernucleus {

void DownloadCenter::beginExternal(const QString& label)
{
    if (busy()) return; // an install owns the bar: stay silent
    m_external = true;
    m_active = QStringLiteral("Python");
    m_label = label;
    m_stepText = tr("Managed Python");
    m_progress = -1.0;
    m_speed.clear();
    m_size.clear();
    m_clock.restart();
    m_lastMs = 0;
    m_lastBytes = 0;
    emit changed();
}

void DownloadCenter::externalProgress(qint64 received, qint64 total)
{
    if (!m_external) return;
    m_progress = total > 0
                     ? static_cast<double>(received) / static_cast<double>(total)
                     : -1.0;
    const qint64 now = m_clock.elapsed();
    if (now - m_lastMs >= 500 && now > 0) {
        m_speed = Format::speed(static_cast<double>(received - m_lastBytes) *
                                1000.0 / static_cast<double>(now - m_lastMs));
        m_lastBytes = received;
        m_lastMs = now;
    }
    m_size = total > 0 ? tr("%1 of %2").arg(Format::bytes(received),
                                            Format::bytes(total))
                       : Format::bytes(received);
    emit changed();
}

void DownloadCenter::endExternal()
{
    if (!m_external) return;
    m_external = false;
    finishJob();
}

} // namespace Hypernucleus
