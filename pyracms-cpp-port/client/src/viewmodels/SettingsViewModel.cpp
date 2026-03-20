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
}

QString SettingsViewModel::repoUrl() const { return m_repoUrl; }

void SettingsViewModel::setRepoUrl(const QString& url)
{
    if (m_repoUrl == url) return;
    m_repoUrl = url;
    emit repoUrlChanged();

    // Validate
    if (validateUrl(url)) {
        if (!m_urlError.isEmpty()) {
            m_urlError.clear();
            emit urlErrorChanged();
        }
    } else {
        m_urlError = "Invalid URL format. Use http:// or https://";
        emit urlErrorChanged();
    }

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

    m_settings->setRepoUrl(m_repoUrl);
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
    // In a full implementation, these could be fetched from the server.
    // For now, use static lists augmented by auto-detection.
    m_osList = {"linux", "macos", "windows"};
    m_archList = {"x86_64", "arm64", "x86"};
    emit osListChanged();
    emit archListChanged();
}

bool SettingsViewModel::validateUrl(const QString& url) const
{
    QUrl parsed(url);
    return parsed.isValid()
        && (parsed.scheme() == "http" || parsed.scheme() == "https")
        && !parsed.host().isEmpty();
}

void SettingsViewModel::loadFromSettings()
{
    m_repoUrl = m_settings->repoUrl();
    m_osName = m_settings->osName();
    m_archName = m_settings->archName();
    m_chunkSize = m_settings->chunkSize();
    m_urlError.clear();

    emit repoUrlChanged();
    emit osNameChanged();
    emit archNameChanged();
    emit chunkSizeChanged();
    emit urlErrorChanged();
}

void SettingsViewModel::checkDirty()
{
    bool dirty = (m_repoUrl != m_settings->repoUrl())
              || (m_osName != m_settings->osName())
              || (m_archName != m_settings->archName())
              || (m_chunkSize != m_settings->chunkSize());
    if (m_isDirty != dirty) {
        m_isDirty = dirty;
        emit isDirtyChanged();
    }
}

} // namespace Hypernucleus
