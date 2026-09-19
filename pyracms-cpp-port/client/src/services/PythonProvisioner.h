#pragma once

#include <QObject>
#include <QUrl>

#include "domain/PythonAssets.h"
#include "services/ProcessRunner.h"

namespace Hypernucleus {

class DownloadManager;
class HttpFetcher;
class PathManager;

// Managed Python: downloads python-build-standalone (astral-sh releases),
// verifies its sha256 against the release's SHA256SUMS and unpacks it into
// <data>/python, where PythonLocator finds it. The UI asks the user before
// anything is downloaded: resolve() -> offerReady -> accept() / decline().
class PythonProvisioner : public QObject {
    Q_OBJECT

public:
    enum class State { Idle, Resolving, Offered, Downloading, Extracting };
    Q_ENUM(State)
    static QString releaseUrl();

    PythonProvisioner(PathManager* paths, HttpFetcher* http,
                      DownloadManager* downloads, ProcessRunner* tar,
                      QObject* parent = nullptr);

    void setPlatform(const QString& os, const QString& arch);
    void setReleaseUrl(const QUrl& url) { m_releaseUrl = url; }
    State state() const { return m_state; }
    bool isBusy() const { return m_state != State::Idle; }
    const PythonAsset& offer() const { return m_asset; }

    void resolve();
    void accept();
    void decline();
    void cancel();

    // bsdtar ships with Windows 10+, macOS and Linux; on Windows the system
    // one is preferred over a GNU tar that would read "C:" as a host.
    static QString tarProgram();

signals:
    void stateChanged();
    void offerReady(const QString& version, qint64 size);
    void progress(qint64 received, qint64 total);
    void installed(const QString& pythonExe);
    void failed(const QString& error);
    void cancelled();

private:
    void fetchChecksums(const QJsonObject& release, int generation);
    void offerAsset();
    void extract(const QString& archive);
    void finishExtract(const QString& staging, const ProcessResult& r);
    void fail(const QString& error);
    void setState(State s);

    PathManager* m_paths;
    HttpFetcher* m_http;
    DownloadManager* m_downloads;
    ProcessRunner* m_tar;
    QUrl m_releaseUrl;
    QString m_os, m_arch;
    PythonAsset m_asset;
    State m_state = State::Idle;
    int m_generation = 0;
};

} // namespace Hypernucleus
