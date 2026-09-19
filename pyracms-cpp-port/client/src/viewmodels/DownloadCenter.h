#pragma once

#include <QStringList>

#include "domain/InstallPlan.h"
#include "viewmodels/DownloadCenterBase.h"

namespace Hypernucleus {

class InstallPlanner;
class InstallRunner;

// Steam-style download queue: one active job, cancel keeps partial files.
class DownloadCenter : public Hypernucleus::DownloadCenterBase {
    Q_OBJECT
    QML_ELEMENT
    QML_UNCREATABLE("Owned by MainViewModel")
    Q_PROPERTY(QStringList queue READ queue NOTIFY queueChanged)

public:
    DownloadCenter(InstallPlanner* planner, InstallRunner* runner,
                   QObject* parent = nullptr);
    QStringList queue() const;
    Q_INVOKABLE void enqueue(const QString& name, const QString& version);
    Q_INVOKABLE void cancelActive();
    Q_INVOKABLE void removeQueued(const QString& name);
    Q_INVOKABLE bool isQueued(const QString& name) const;

    // A transfer that is not a game install (the managed Python) shown in
    // the same progress bar. Cancelling asks the owner through the signal.
    void beginExternal(const QString& label);
    void externalProgress(qint64 received, qint64 total);
    void endExternal();
    bool isExternal() const { return m_external; }

signals:
    void queueChanged();
    void gameStateChanged(const QString& name, int state, double progress,
                          const QString& text);
    void gameFinished(const QString& name, const QString& version);
    void gameFailed(const QString& name, const QString& error);
    void gameCancelled(const QString& name);
    void externalCancelRequested();

private:
    struct Job {
        QString name, version;
    };
    void start(const Job& job);
    void finishJob();
    void onProgress(int phase, qint64 received, qint64 total);
    void fail(const QString& error);
    InstallPlanner* m_planner;
    InstallRunner* m_runner;
    QList<Job> m_queue;
    QString m_activeVersion;
    QString m_stepLabel;
    bool m_cancelled = false;
    bool m_external = false;
};

} // namespace Hypernucleus
