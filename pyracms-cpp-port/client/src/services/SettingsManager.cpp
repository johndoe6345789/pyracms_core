#include "services/SettingsManager.h"

#include <QSettings>
#include <QSysInfo>

namespace Hypernucleus {

SettingsManager::SettingsManager(QObject* parent)
    : QObject(parent)
    , m_repoUrl(DEFAULT_REPO_URL)
    , m_osName(detectOs())
    , m_archName(detectArch())
    , m_chunkSize(DEFAULT_CHUNK_SIZE)
    , m_windowGeometry(100, 100, 1280, 800)
    , m_darkMode(true)
    , m_language("en")
{
    load();
}

QString SettingsManager::repoUrl() const { return m_repoUrl; }

void SettingsManager::setRepoUrl(const QString& url)
{
    if (m_repoUrl == url) return;
    m_repoUrl = url;
    emit repoUrlChanged();
}

QString SettingsManager::osName() const { return m_osName; }

void SettingsManager::setOsName(const QString& name)
{
    if (m_osName == name) return;
    m_osName = name;
    emit osNameChanged();
}

QString SettingsManager::archName() const { return m_archName; }

void SettingsManager::setArchName(const QString& name)
{
    if (m_archName == name) return;
    m_archName = name;
    emit archNameChanged();
}

int SettingsManager::chunkSize() const { return m_chunkSize; }

void SettingsManager::setChunkSize(int size)
{
    if (size < 1024) size = 1024;
    if (size > 1048576) size = 1048576;
    if (m_chunkSize == size) return;
    m_chunkSize = size;
    emit chunkSizeChanged();
}

QRect SettingsManager::windowGeometry() const { return m_windowGeometry; }

void SettingsManager::setWindowGeometry(const QRect& geometry)
{
    if (m_windowGeometry == geometry) return;
    m_windowGeometry = geometry;
    emit windowGeometryChanged();
}

bool SettingsManager::darkMode() const { return m_darkMode; }

void SettingsManager::setDarkMode(bool dark)
{
    if (m_darkMode == dark) return;
    m_darkMode = dark;
    emit darkModeChanged();
}

QString SettingsManager::tenantSlug() const { return m_tenantSlug; }

void SettingsManager::setTenantSlug(const QString& slug)
{
    const QString s = slug.trimmed();
    if (m_tenantSlug == s) return;
    m_tenantSlug = s;
    emit tenantSlugChanged();
}

QString SettingsManager::installDir() const { return m_installDir; }

void SettingsManager::setInstallDir(const QString& dir)
{
    const QString d = dir.trimmed();
    if (m_installDir == d) return;
    m_installDir = d;
    emit installDirChanged();
}

QString SettingsManager::pythonPath() const { return m_pythonPath; }

void SettingsManager::setPythonPath(const QString& path)
{
    const QString p = path.trimmed();
    if (m_pythonPath == p) return;
    m_pythonPath = p;
    emit pythonPathChanged();
}

bool SettingsManager::preferPip() const { return m_preferPip; }

void SettingsManager::setPreferPip(bool on)
{
    if (m_preferPip == on) return;
    m_preferPip = on;
    emit preferPipChanged();
}

QString SettingsManager::language() const { return m_language; }

void SettingsManager::setLanguage(const QString& lang)
{
    if (m_language == lang) return;
    m_language = lang;
    emit languageChanged();
}

void SettingsManager::save()
{
    QSettings settings;
    settings.beginGroup("settings");
    settings.setValue("repoUrl", m_repoUrl);
    settings.setValue("osName", m_osName);
    settings.setValue("archName", m_archName);
    settings.setValue("chunkSize", m_chunkSize);
    settings.setValue("windowGeometry", m_windowGeometry);
    settings.setValue("darkMode", m_darkMode);
    settings.setValue("language", m_language);
    settings.setValue("tenantSlug", m_tenantSlug);
    settings.setValue("installDir", m_installDir);
    settings.setValue("pythonPath", m_pythonPath);
    settings.setValue("preferPip", m_preferPip);
    settings.endGroup();
    settings.sync();
}

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
    save();
}

QString SettingsManager::detectOs()
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

QString SettingsManager::detectArch()
{
    QString cpu = QSysInfo::currentCpuArchitecture();
    if (cpu == "x86_64" || cpu == "amd64")
        return "x86_64";
    else if (cpu == "arm64" || cpu == "aarch64")
        return "arm64";
    else if (cpu == "i386" || cpu == "x86")
        return "x86";
    return cpu;
}

} // namespace Hypernucleus
