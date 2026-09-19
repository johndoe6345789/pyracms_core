#pragma once

#include <QAbstractListModel>
#include <QColor>
#include <QHash>
#include <QStringList>

namespace Hypernucleus {

// Row storage and role ids of GameDepModel.
class GameDepRows : public QAbstractListModel {
public:
    enum Roles {
        NameRole = Qt::UserRole + 1,
        TitleRole,
        DescriptionRole,
        TagsRole,
        InstalledRole,
        InstalledVersionRole,
        LatestVersionRole,
        UpdateAvailableRole,
        StateRole,
        ProgressRole,
        StatusTextRole,
        FavouriteRole,
        AccentRole,
        CoverRole,
        GroupRole,
        PrimaryKindRole,
        PrimaryLabelRole,
        SizeRole,
        ScreenshotCountRole
    };
    using QAbstractListModel::QAbstractListModel;

protected:
    struct Row {
        QString name;
        QString title;
        QString description;
        QStringList tags;
        QString latest;
        QString coverRef;
        QColor accent;
        QString size; // download size for this platform, "" = unknown
        int shots = 0;
    };
    struct Transient {
        int state = 0;
        double progress = 0.0;
        QString text;
    };
    QList<Row> m_rows;
    QHash<QString, Transient> m_transient;
};

} // namespace Hypernucleus
