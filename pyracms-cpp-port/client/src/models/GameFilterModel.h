#pragma once

#include <QSortFilterProxyModel>
#include <QtQml/qqmlregistration.h>

namespace Hypernucleus {

// Search + filter (All / Installed / Updates) + category (tag or favourites)
// over GameDepModel. Installed games sort first so the sidebar can show
// "Installed" and "Not installed" sections.
class GameFilterModel : public QSortFilterProxyModel {
    Q_OBJECT
    QML_ELEMENT
    QML_UNCREATABLE("Owned by MainViewModel")
    Q_PROPERTY(QString searchText READ searchText WRITE setSearchText NOTIFY searchTextChanged)
    Q_PROPERTY(int filter READ filter WRITE setFilter NOTIFY filterChanged)
    Q_PROPERTY(QString category READ category WRITE setCategory NOTIFY categoryChanged)
    Q_PROPERTY(int count READ count NOTIFY countChanged)

public:
    explicit GameFilterModel(QObject* parent = nullptr);

    void setSourceModel(QAbstractItemModel* model) override;

    QString searchText() const { return m_search; }
    void setSearchText(const QString& text);
    int filter() const { return m_filter; }
    void setFilter(int filter);
    QString category() const { return m_category; }
    void setCategory(const QString& category);
    int count() const { return rowCount(); }

    // Row index in this proxy for a game name, -1 if filtered out.
    Q_INVOKABLE int indexOfName(const QString& name) const;
    Q_INVOKABLE QString nameAt(int row) const;

signals:
    void searchTextChanged();
    void filterChanged();
    void categoryChanged();
    void countChanged();

protected:
    bool filterAcceptsRow(int sourceRow, const QModelIndex& parent) const override;
    bool lessThan(const QModelIndex& left, const QModelIndex& right) const override;

private:
    QString m_search;
    int m_filter = 0;
    QString m_category;
};

} // namespace Hypernucleus
