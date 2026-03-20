#pragma once

#include <QObject>
#include <QRect>
#include <QString>

namespace Hypernucleus {

class SettingsManager : public QObject {
    Q_OBJECT
    Q_PROPERTY(QString repoUrl READ repoUrl WRITE setRepoUrl NOTIFY repoUrlChanged)
    Q_PROPERTY(QString osName READ osName WRITE setOsName NOTIFY osNameChanged)
    Q_PROPERTY(QString archName READ archName WRITE setArchName NOTIFY archNameChanged)
    Q_PROPERTY(int chunkSize READ chunkSize WRITE setChunkSize NOTIFY chunkSizeChanged)
    Q_PROPERTY(QRect windowGeometry READ windowGeometry WRITE setWindowGeometry NOTIFY windowGeometryChanged)
    Q_PROPERTY(bool darkMode READ darkMode WRITE setDarkMode NOTIFY darkModeChanged)
    Q_PROPERTY(QString language READ language WRITE setLanguage NOTIFY languageChanged)

public:
    explicit SettingsManager(QObject* parent = nullptr);

    // Property accessors
    QString repoUrl() const;
    void setRepoUrl(const QString& url);

    QString osName() const;
    void setOsName(const QString& name);

    QString archName() const;
    void setArchName(const QString& name);

    int chunkSize() const;
    void setChunkSize(int size);

    QRect windowGeometry() const;
    void setWindowGeometry(const QRect& geometry);

    bool darkMode() const;
    void setDarkMode(bool dark);

    QString language() const;
    void setLanguage(const QString& lang);

    // Persistence
    Q_INVOKABLE void save();
    Q_INVOKABLE void load();
    Q_INVOKABLE void reset();

    // Auto-detect defaults
    static QString detectOs();
    static QString detectArch();

signals:
    void repoUrlChanged();
    void osNameChanged();
    void archNameChanged();
    void chunkSizeChanged();
    void windowGeometryChanged();
    void darkModeChanged();
    void languageChanged();

private:
    static constexpr const char* DEFAULT_REPO_URL = "http://localhost:8080";
    static constexpr int DEFAULT_CHUNK_SIZE = 8192;

    QString m_repoUrl;
    QString m_osName;
    QString m_archName;
    int m_chunkSize;
    QRect m_windowGeometry;
    bool m_darkMode;
    QString m_language;
};

} // namespace Hypernucleus
