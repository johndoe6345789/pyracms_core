#pragma once

#include "models/GameDepRows.h"

#include <QtQml/qqmlregistration.h>

namespace Hypernucleus {

class ApiClient;
class EntryRepository;
class ModuleInstaller;

// One row per game of the tenant. Combines catalog data, the installed
// state and a transient per-game state (downloading, launching, failed ...)
// into the state that the primary button shows.
class GameDepModel : public Hypernucleus::GameDepRows {
    Q_OBJECT
    QML_ELEMENT
    QML_UNCREATABLE("Owned by MainViewModel")
    Q_PROPERTY(int count READ count NOTIFY countChanged)
    Q_PROPERTY(QStringList categories READ categories NOTIFY categoriesChanged)

public:
    explicit GameDepModel(QObject* parent = nullptr);
    void attach(EntryRepository* repo, ModuleInstaller* installer,
                ApiClient* api);
    int rowCount(const QModelIndex& parent = QModelIndex()) const override;
    QVariant data(const QModelIndex& index,
                  int role = Qt::DisplayRole) const override;
    QHash<int, QByteArray> roleNames() const override;
    int count() const { return m_rows.size(); }
    QStringList categories() const;
    // State shown on the primary button (GameStates::State as int).
    int stateOf(const QString& name) const;
    double progressOf(const QString& name) const;
    QString statusTextOf(const QString& name) const;
    QColor accentOf(const QString& name) const;
    void setTransient(const QString& name, int state, double progress = 0.0,
                      const QString& text = QString());
    void clearTransient(const QString& name);
    Q_INVOKABLE bool isFavourite(const QString& name) const;
    Q_INVOKABLE void toggleFavourite(const QString& name);
    QStringList favourites() const { return m_favourites; }
    void rebuild();
    void refreshAll();
    void refreshRow(const QString& name);

signals:
    void countChanged();
    void categoriesChanged();

private:
    int rowOf(const QString& name) const;
    void fillRow(Row& row) const;
    int computeState(const Row& row) const;
    bool updateAvailable(const Row& row) const;
    void emitRow(int row, const QList<int>& roles = QList<int>());
    EntryRepository* m_repo = nullptr;
    ModuleInstaller* m_installer = nullptr;
    ApiClient* m_api = nullptr;
    QStringList m_favourites;
};

} // namespace Hypernucleus
