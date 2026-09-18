#include "viewmodels/SettingsViewModel.h"
#include "services/SettingsManager.h"
#include "services/ApiClient.h"

#include <QUrl>

namespace Hypernucleus {

SettingsViewModel::SettingsViewModel(SettingsManager* settings, ApiClient* apiClient,
                                     QObject* parent)
    : QObject(parent)
    , m_settings(settings)
    , m_apiClient(apiClient)
    , m_osList({"linux", "macos", "windows"})
    , m_archList({"x86_64", "arm64", "x86"})
{
    loadFromSettings();
    // Keep the editing copy in step when something else (login, deep link)
    // changes the site slug.
    connect(m_settings, &SettingsManager::tenantSlugChanged, this, [this]() {
        if (!m_isDirty)
            loadFromSettings();
    });
}

QString SettingsViewModel::repoUrl() const { return m_repoUrl; }

void SettingsViewModel::setRepoUrl(const QString& url)
{
    if (m_repoUrl == url) return;
    m_repoUrl = url;
    emit repoUrlChanged();

    const QString error = validateUrl(url)
        ? QString() : tr("Invalid URL. Use http:// or https://");
    if (m_urlError != error) {
        m_urlError = error;
        emit urlErrorChanged();
    }
    checkDirty();
}

QString SettingsViewModel::tenantSlug() const { return m_tenantSlug; }
void SettingsViewModel::setTenantSlug(const QString& slug)
{
    if (m_tenantSlug == slug) return;
    m_tenantSlug = slug;
    emit tenantSlugChanged();
    checkDirty();
}

QString SettingsViewModel::installDir() const { return m_installDir; }
void SettingsViewModel::setInstallDir(const QString& dir)
{
    if (m_installDir == dir) return;
    m_installDir = dir;
    emit installDirChanged();
    checkDirty();
}

QString SettingsViewModel::pythonPath() const { return m_pythonPath; }
void SettingsViewModel::setPythonPath(const QString& path)
{
    if (m_pythonPath == path) return;
    m_pythonPath = path;
    emit pythonPathChanged();
    checkDirty();
}

bool SettingsViewModel::preferPip() const { return m_preferPip; }
void SettingsViewModel::setPreferPip(bool on)
{
    if (m_preferPip == on) return;
    m_preferPip = on;
    emit preferPipChanged();
    checkDirty();
}

QString SettingsViewModel::osName() const { return m_osName; }
void SettingsViewModel::setOsName(const QString& name)
{
    if (m_osName == name) return;
    m_osName = name;
    emit osNameChanged();
    checkDirty();
}

QString SettingsViewModel::archName() const { return m_archName; }
void SettingsViewModel::setArchName(const QString& name)
{
    if (m_archName == name) return;
    m_archName = name;
    emit archNameChanged();
    checkDirty();
}

QStringList SettingsViewModel::osList() const { return m_osList; }
QStringList SettingsViewModel::archList() const { return m_archList; }

int SettingsViewModel::chunkSize() const { return m_chunkSize; }
void SettingsViewModel::setChunkSize(int size)
{
    if (m_chunkSize == size) return;
    m_chunkSize = size;
    emit chunkSizeChanged();
    checkDirty();
}

bool SettingsViewModel::isDirty() const { return m_isDirty; }
QString SettingsViewModel::urlError() const { return m_urlError; }

void SettingsViewModel::save()
{
    if (!m_urlError.isEmpty())
        return;

    // The tenant slug applies to the API client through MainViewModel, which
    // listens to SettingsManager changes.
    m_settings->setRepoUrl(m_repoUrl);
    m_settings->setTenantSlug(m_tenantSlug);
    m_settings->setInstallDir(m_installDir);
    m_settings->setPythonPath(m_pythonPath);
    m_settings->setPreferPip(m_preferPip);
    m_settings->setOsName(m_osName);
    m_settings->setArchName(m_archName);
    m_settings->setChunkSize(m_chunkSize);
    m_settings->save();

    m_isDirty = false;
    emit isDirtyChanged();
    emit saved();
}

void SettingsViewModel::cancel()
{
    loadFromSettings();
    m_isDirty = false;
    emit isDirtyChanged();
    emit cancelled();
}

void SettingsViewModel::resetDefaults()
{
    m_settings->reset();
    loadFromSettings();
    m_isDirty = false;
    emit isDirtyChanged();
}

void SettingsViewModel::fetchOsArchLists()
{
    m_osList = {"linux", "macos", "windows"};
    m_archList = {"x86_64", "arm64", "x86"};
    emit osListChanged();
    emit archListChanged();
}

bool SettingsViewModel::validateUrl(const QString& url) const
{
    const QUrl parsed(url);
    return parsed.isValid()
        && (parsed.scheme() == "http" || parsed.scheme() == "https")
        && !parsed.host().isEmpty();
}

void SettingsViewModel::loadFromSettings()
{
    m_repoUrl = m_settings->repoUrl();
    m_tenantSlug = m_settings->tenantSlug();
    m_installDir = m_settings->installDir();
    m_pythonPath = m_settings->pythonPath();
    m_preferPip = m_settings->preferPip();
    m_osName = m_settings->osName();
    m_archName = m_settings->archName();
    m_chunkSize = m_settings->chunkSize();
    m_urlError.clear();

    emit repoUrlChanged();
    emit tenantSlugChanged();
    emit installDirChanged();
    emit pythonPathChanged();
    emit preferPipChanged();
    emit osNameChanged();
    emit archNameChanged();
    emit chunkSizeChanged();
    emit urlErrorChanged();
}

void SettingsViewModel::checkDirty()
{
    const bool dirty = m_repoUrl != m_settings->repoUrl()
        || m_tenantSlug != m_settings->tenantSlug()
        || m_installDir != m_settings->installDir()
        || m_pythonPath != m_settings->pythonPath()
        || m_preferPip != m_settings->preferPip()
        || m_osName != m_settings->osName()
        || m_archName != m_settings->archName()
        || m_chunkSize != m_settings->chunkSize();
    if (m_isDirty != dirty) {
        m_isDirty = dirty;
        emit isDirtyChanged();
    }
}

} // namespace Hypernucleus
