#include "services/SettingsManager.h"

#include <QSettings>
#include <QSysInfo>

namespace Hypernucleus {

void SettingsManager::load()
{
    QSettings settings;
    settings.beginGroup("settings");

    if (settings.contains("repoUrl"))
        setRepoUrl(settings.value("repoUrl").toString());
    if (settings.contains("osName"))
        setOsName(settings.value("osName").toString());
    if (settings.contains("archName"))
        setArchName(settings.value("archName").toString());
    if (settings.contains("chunkSize"))
        setChunkSize(settings.value("chunkSize").toInt());
    if (settings.contains("windowGeometry"))
        setWindowGeometry(settings.value("windowGeometry").toRect());
    if (settings.contains("darkMode"))
        setDarkMode(settings.value("darkMode").toBool());
    if (settings.contains("language"))
        setLanguage(settings.value("language").toString());
    if (settings.contains("tenantSlug"))
        setTenantSlug(settings.value("tenantSlug").toString());
    if (settings.contains("installDir"))
        setInstallDir(settings.value("installDir").toString());
    if (settings.contains("pythonPath"))
        setPythonPath(settings.value("pythonPath").toString());
    if (settings.contains("preferPip"))
        setPreferPip(settings.value("preferPip").toBool());
    if (settings.contains("recentServers"))
        setRecentServers(settings.value("recentServers").toStringList());
    // 8080 is the raw backend port; the launcher talks to the proxy.
    if (m_repoUrl == QLatin1String("http://localhost:8080"))
        setRepoUrl(DEFAULT_REPO_URL);

    settings.endGroup();
}

void SettingsManager::reset()
{
    setRepoUrl(DEFAULT_REPO_URL);
    setOsName(detectOs());
    setArchName(detectArch());
    setChunkSize(DEFAULT_CHUNK_SIZE);
    setWindowGeometry(QRect(100, 100, 1280, 800));
    setDarkMode(true);
    setLanguage("en");
    setTenantSlug(QString());
    setInstallDir(QString());
    setPythonPath(QString());
    setPreferPip(true);
    setRecentServers(QStringList());
    save();
}

QString SettingsBase::detectOs()
{
    QString kernel = QSysInfo::kernelType();
    if (kernel == "linux")
        return "linux";
    else if (kernel == "darwin")
        return "macos";
    else if (kernel == "winnt")
        return "windows";
    return kernel;
}

} // namespace Hypernucleus
