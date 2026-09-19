#include "services/SettingsManager.h"

#include <QSettings>
#include <QSysInfo>

namespace Hypernucleus {

SettingsManager::SettingsManager(QObject* parent)
    : SettingsBase(parent), m_darkMode(true), m_language("system")
{
    load();
}

bool SettingsManager::darkMode() const { return m_darkMode; }

void SettingsManager::setDarkMode(bool dark)
{
    if (m_darkMode == dark) return;
    m_darkMode = dark;
    emit darkModeChanged();
}

} // namespace Hypernucleus
