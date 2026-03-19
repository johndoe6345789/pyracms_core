#pragma once

#include <QObject>
#include <QString>

namespace Hypernucleus {

class PathManager : public QObject {
    Q_OBJECT
    Q_PROPERTY(QString dataDir READ dataDir CONSTANT)
    Q_PROPERTY(QString gamesDir READ gamesDir CONSTANT)
    Q_PROPERTY(QString depsDir READ depsDir CONSTANT)
    Q_PROPERTY(QString picturesDir READ picturesDir CONSTANT)
    Q_PROPERTY(QString archivesDir READ archivesDir CONSTANT)

public:
    explicit PathManager(QObject* parent = nullptr);

    QString dataDir() const;
    QString gamesDir() const;
    QString depsDir() const;
    QString picturesDir() const;
    QString archivesDir() const;

    Q_INVOKABLE QString gameDir(const QString& name, const QString& version) const;
    Q_INVOKABLE QString depDir(const QString& name, const QString& version) const;
    Q_INVOKABLE QString archivePath(const QString& filename) const;

private:
    void ensureDirectories();

    QString m_dataDir;
    QString m_gamesDir;
    QString m_depsDir;
    QString m_picturesDir;
    QString m_archivesDir;
};

} // namespace Hypernucleus
