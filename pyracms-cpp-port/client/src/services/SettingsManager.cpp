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

void SettingsManager::save()
{
    QSettings settings;
    settings.beginGroup("settings");
    settings.setValue("repoUrl", m_repoUrl);
    settings.setValue("osName", m_osName);
    settings.setValue("archName", m_archName);
    settings.setValue("chunkSize", m_chunkSize);
    settings.setValue("windowGeometry", m_windowGeometry);
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

    settings.endGroup();
}

void SettingsManager::reset()
{
    setRepoUrl(DEFAULT_REPO_URL);
    setOsName(detectOs());
    setArchName(detectArch());
    setChunkSize(DEFAULT_CHUNK_SIZE);
    setWindowGeometry(QRect(100, 100, 1280, 800));
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
