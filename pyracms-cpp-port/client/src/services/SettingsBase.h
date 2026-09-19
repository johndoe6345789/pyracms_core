#pragma once

#include <QObject>
#include <QtQml/qqmlregistration.h>
#include <QRect>
#include <QString>

namespace Hypernucleus {

// Server / platform / window settings (first half of SettingsManager).
class SettingsBase : public QObject {
    Q_OBJECT
    QML_ANONYMOUS
    Q_PROPERTY(
        QString repoUrl READ repoUrl WRITE setRepoUrl NOTIFY repoUrlChanged)
    Q_PROPERTY(QString osName READ osName WRITE setOsName NOTIFY osNameChanged)
    Q_PROPERTY(
        QString archName READ archName WRITE setArchName NOTIFY archNameChanged)
    Q_PROPERTY(
        int chunkSize READ chunkSize WRITE setChunkSize NOTIFY chunkSizeChanged)
    Q_PROPERTY(QRect windowGeometry READ windowGeometry WRITE setWindowGeometry
                   NOTIFY windowGeometryChanged)

public:
    explicit SettingsBase(QObject* parent = nullptr);

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

    // Auto-detect defaults
    static QString detectOs();
    static QString detectArch();

signals:
    void repoUrlChanged();
    void osNameChanged();
    void archNameChanged();
    void chunkSizeChanged();
    void windowGeometryChanged();

protected:
    static constexpr const char* DEFAULT_REPO_URL = "http://localhost:3199";
    static constexpr int DEFAULT_CHUNK_SIZE = 8192;

    QString m_repoUrl;
    QString m_osName;
    QString m_archName;
    int m_chunkSize;
    QRect m_windowGeometry;
};

} // namespace Hypernucleus
