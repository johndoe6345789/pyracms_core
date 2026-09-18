#pragma once

#include "domain/GameEntry.h"

#include <QAbstractListModel>
#include <QList>
#include <QMap>
#include <QString>
#include <QtQml/qqmlregistration.h>

namespace Hypernucleus {

struct DependencyEntry {
    QString name;
    QString version;
    QString source;        // "pip", "pyracms" or "" (decided at install time)
    bool installed = false;
};

// Dependency list of the selected game for the detail page.
class DependencyModel : public QAbstractListModel {
    Q_OBJECT
    QML_ELEMENT
    QML_UNCREATABLE("Owned by MainViewModel")
    Q_PROPERTY(int count READ count NOTIFY countChanged)

public:
    enum Roles {
        DepNameRole = Qt::UserRole + 1,
        DepVersionRole,
        DepSourceRole,
        DepInstalledRole
    };

    explicit DependencyModel(QObject* parent = nullptr);

    int rowCount(const QModelIndex& parent = QModelIndex()) const override;
    QVariant data(const QModelIndex& index, int role = Qt::DisplayRole) const override;
    QHash<int, QByteArray> roleNames() const override;

    void populate(const QList<DepRef>& dependencies,
                  const QMap<QString, QString>& installedVersions);
    Q_INVOKABLE void clear();

    int count() const;

signals:
    void countChanged();

private:
    QList<DependencyEntry> m_entries;
};

} // namespace Hypernucleus
