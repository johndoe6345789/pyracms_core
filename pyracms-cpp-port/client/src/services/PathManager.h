#pragma once

#include <QObject>
#include <QtQml/qqmlregistration.h>
#include <QString>

namespace Hypernucleus {

// Install layout ported from the original Hypernucleus client:
//   <dataDir>/games/<name>          extracted game
//   <dataDir>/dependencies/<name>   extracted PyraCMS dependency module
//   <dataDir>/pictures  <dataDir>/archives
// plus launcher additions: pylibs/<game> (pip --target) and logs/.
// There is no per-version subfolder: exactly one version of a module is
// installed at a time and the version is tracked in installed.json.
class PathManager : public QObject {
    Q_OBJECT
    QML_ANONYMOUS
    Q_PROPERTY(QString dataDir READ dataDir NOTIFY pathsChanged)
    Q_PROPERTY(QString gamesDir READ gamesDir NOTIFY pathsChanged)
    Q_PROPERTY(QString depsDir READ depsDir NOTIFY pathsChanged)
    Q_PROPERTY(QString picturesDir READ picturesDir NOTIFY pathsChanged)
    Q_PROPERTY(QString archivesDir READ archivesDir NOTIFY pathsChanged)
    Q_PROPERTY(QString logsDir READ logsDir NOTIFY pathsChanged)

public:
    // An empty overrideDir uses the platform default (same locations as the
    // original client: ~/.config/hypernucleus, ~/Library/Application Support/
    // hypernucleus, %APPDATA%/hypernucleus/hypernucleus).
    explicit PathManager(QObject* parent = nullptr);
    // Everything (config + install root) below one folder, for tests.
    explicit PathManager(const QString& overrideDir, QObject* parent = nullptr);
    // installRoot: games/dependencies/pylibs/archives/pictures. configDir:
    // installed.json, config.ini and logs stay put when the install folder
    // is changed so existing installs are never forgotten.
    PathManager(const QString& installRoot, const QString& configDir,
                QObject* parent = nullptr);

    static QString defaultDataDir();

    QString dataDir() const;
    QString configDir() const;
    QString gamesDir() const;
    QString depsDir() const;
    QString picturesDir() const;
    QString archivesDir() const;
    QString logsDir() const;
    QString pylibsDir() const;
    QString stateFile() const;
    QString legacyIniFile() const;

    // Empty string restores the default location.
    Q_INVOKABLE void setDataDir(const QString& dir);

    // `version` is accepted for API compatibility but not part of the path.
    Q_INVOKABLE QString gameDir(const QString& name,
                                const QString& version = QString()) const;
    Q_INVOKABLE QString depDir(const QString& name,
                               const QString& version = QString()) const;
    // Legacy `pip --target` folder of a game; the venv lives below it.
    QString pipTargetDir(const QString& gameName) const;
    // pylibs/<game>/venv and the interpreter inside it (exists = built).
    QString venvDir(const QString& gameName) const;
    QString venvPython(const QString& gameName) const;
    // Old --target content (everything except venv/) still on disk?
    bool hasLegacyTarget(const QString& gameName) const;
    void cleanLegacyTarget(const QString& gameName) const;
    Q_INVOKABLE QString archivePath(const QString& filename) const;

signals:
    void pathsChanged();

private:
    void apply(const QString& dir);
    void ensureDirectories();

    QString m_dataDir;
    QString m_configDir;
};

} // namespace Hypernucleus
