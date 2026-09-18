#include "services/SettingsBase.h"

#include <QSysInfo>

namespace Hypernucleus {

SettingsBase::SettingsBase(QObject* parent)
    : QObject(parent), m_repoUrl(DEFAULT_REPO_URL), m_osName(detectOs()),
      m_archName(detectArch()), m_chunkSize(DEFAULT_CHUNK_SIZE),
      m_windowGeometry(100, 100, 1280, 800)
{
}

QString SettingsBase::repoUrl() const { return m_repoUrl; }

void SettingsBase::setRepoUrl(const QString& url)
{
    if (m_repoUrl == url) return;
    m_repoUrl = url;
    emit repoUrlChanged();
}

QString SettingsBase::osName() const { return m_osName; }

void SettingsBase::setOsName(const QString& name)
{
    if (m_osName == name) return;
    m_osName = name;
    emit osNameChanged();
}

QString SettingsBase::archName() const { return m_archName; }

void SettingsBase::setArchName(const QString& name)
{
    if (m_archName == name) return;
    m_archName = name;
    emit archNameChanged();
}

int SettingsBase::chunkSize() const { return m_chunkSize; }

void SettingsBase::setChunkSize(int size)
{
    if (size < 1024) size = 1024;
    if (size > 1048576) size = 1048576;
    if (m_chunkSize == size) return;
    m_chunkSize = size;
    emit chunkSizeChanged();
}

QRect SettingsBase::windowGeometry() const { return m_windowGeometry; }

void SettingsBase::setWindowGeometry(const QRect& geometry)
{
    if (m_windowGeometry == geometry) return;
    m_windowGeometry = geometry;
    emit windowGeometryChanged();
}

} // namespace Hypernucleus
