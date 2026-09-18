#include "domain/InstallStateStore.h"

#include <QDateTime>
#include <QDir>
#include <QFile>
#include <QFileInfo>
#include <QJsonArray>
#include <QJsonDocument>
#include <QJsonObject>
#include <QSaveFile>
#include <QSettings>

namespace Hypernucleus {

InstallStateStore::InstallStateStore(const QString& filePath)
    : m_filePath(filePath)
{
}

} // namespace Hypernucleus
