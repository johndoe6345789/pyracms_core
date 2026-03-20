#pragma once

#include <QAbstractListModel>
#include <QJsonArray>
#include <QList>
#include <QString>

namespace Hypernucleus {

struct DependencyEntry {
    QString name;
    QString version;
    bool installed = false;
};

class DependencyModel : public QAbstractListModel {
    Q_OBJECT
    Q_PROPERTY(int count READ count NOTIFY countChanged)

public:
    explicit DependencyModel(QObject* parent = nullptr);

    // QAbstractListModel interface
    int rowCount(const QModelIndex& parent = QModelIndex()) const override;
    QVariant data(const QModelIndex& index, int role = Qt::DisplayRole) const override;
    QHash<int, QByteArray> roleNames() const override;

    // Public API
    Q_INVOKABLE void populate(const QJsonArray& dependencies,
                              const QMap<QString, QString>& installedVersions);
    Q_INVOKABLE void clear();

    int count() const;

signals:
    void countChanged();

private:
    QList<DependencyEntry> m_entries;
};

} // namespace Hypernucleus
