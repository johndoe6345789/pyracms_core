#pragma once

#include <QAbstractItemModel>
#include <QJsonObject>
#include <QJsonArray>
#include <QList>
#include <QMap>
#include <QString>
#include <QVariant>

namespace Hypernucleus {

struct GameDepItem {
    QString name;
    QString displayName;
    QString description;
    QString type;           // "game" or "dep"
    bool installed = false;
    QString installedVersion;
    QString uuid;
    QJsonArray pictures;
    QJsonArray dependencies;
    QJsonObject revisions;
    QList<GameDepItem*> children;
    GameDepItem* parent = nullptr;
    int row = 0;

    ~GameDepItem() { qDeleteAll(children); }
};

class GameDepModel : public QAbstractItemModel {
    Q_OBJECT
    Q_PROPERTY(QString searchText READ searchText WRITE setSearchText NOTIFY searchTextChanged)
    Q_PROPERTY(int totalCount READ totalCount NOTIFY totalCountChanged)

public:
    explicit GameDepModel(QObject* parent = nullptr);
    ~GameDepModel() override;

    // QAbstractItemModel interface
    QModelIndex index(int row, int column, const QModelIndex& parent = QModelIndex()) const override;
    QModelIndex parent(const QModelIndex& child) const override;
    int rowCount(const QModelIndex& parent = QModelIndex()) const override;
    int columnCount(const QModelIndex& parent = QModelIndex()) const override;
    QVariant data(const QModelIndex& index, int role = Qt::DisplayRole) const override;
    QHash<int, QByteArray> roleNames() const override;

    // Public API
    Q_INVOKABLE void populate(const QJsonObject& catalog);
    Q_INVOKABLE void markInstalled(const QString& name, const QString& version);
    Q_INVOKABLE void markUninstalled(const QString& name);
    Q_INVOKABLE QJsonObject itemData(const QModelIndex& index) const;

    QString searchText() const;
    void setSearchText(const QString& text);
    int totalCount() const;

signals:
    void searchTextChanged();
    void totalCountChanged();

private:
    void clear();
    void rebuildFiltered();
    GameDepItem* createCategoryItem(const QString& name);
    GameDepItem* itemFromIndex(const QModelIndex& index) const;

    GameDepItem* m_rootItem = nullptr;
    QJsonObject m_fullCatalog;
    QString m_searchText;
    QMap<QString, bool> m_installedMap;       // name -> installed
    QMap<QString, QString> m_installedVersions; // name -> version
};

} // namespace Hypernucleus
