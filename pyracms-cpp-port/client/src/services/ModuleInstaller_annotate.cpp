#include "services/ModuleInstaller.h"
#include "services/ApiClient.h"
#include "services/ArchiveExtractor.h"
#include "services/DownloadManager.h"
#include "services/PathManager.h"

#include <QDir>
#include <QFile>
#include <QFileInfo>
#include <QRegularExpression>
#include <QUrl>
#include <functional>

namespace Hypernucleus {

void ModuleInstaller::annotate(const QString& name, const QStringList& deps,
                               const QStringList& pipSpecs)
{
    if (!m_store.contains(name)) return;
    InstallRecord rec = m_store.get(name);
    rec.deps = deps;
    rec.pipSpecs = pipSpecs;
    m_store.set(rec);
    saveState();
}

void ModuleInstaller::saveState() { m_store.save(); }

QList<QPair<QString, QString>>
ModuleInstaller::resolveDependencies(const QJsonArray& dependencies,
                                     const QJsonObject& catalog) const
{
    QList<QPair<QString, QString>> result;
    QSet<QString> visited;

    std::function<void(const QJsonArray&)> resolve =
        [&](const QJsonArray& deps) {
            for (const auto& depVal : deps) {
                QJsonObject depObj = depVal.toObject();
                QString depName = depObj.value("name").toString();
                QString depVersion = depObj.value("version").toString();

                if (visited.contains(depName)) continue;
                visited.insert(depName);

                // Skip already installed deps with correct version
                if (m_store.version(depName) == depVersion &&
                    !depVersion.isEmpty())
                    continue;

                QJsonObject depsSection =
                    catalog.value("dependencies").toObject();
                if (depsSection.contains(depName)) {
                    QJsonObject depCatalogEntry =
                        depsSection[depName].toObject();
                    QJsonArray subDeps =
                        depCatalogEntry.value("dependencies").toArray();
                    if (!subDeps.isEmpty()) resolve(subDeps);
                }
                result.append({depName, depVersion});
            }
        };

    resolve(dependencies);
    return result;
}

void ModuleInstaller::setBusy(bool busy)
{
    if (m_busy == busy) return;
    m_busy = busy;
    emit busyChanged();
}

} // namespace Hypernucleus
