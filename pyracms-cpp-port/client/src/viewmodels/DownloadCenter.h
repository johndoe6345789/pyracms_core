#pragma once

#include <QElapsedTimer>
#include <QObject>
#include <QStringList>
#include <QtQml/qqmlregistration.h>

#include "domain/InstallPlan.h"

namespace Hypernucleus {

class InstallPlanner;
class InstallRunner;

// Steam-style download manager: a queue of installs/updates, one active
// job with progress, speed and step information, cancel keeps partial files
// so the next attempt resumes.
class DownloadCenter : public QObject {
    Q_OBJECT
    QML_ELEMENT
    QML_UNCREATABLE("Owned by MainViewModel")
    Q_PROPERTY(bool busy READ busy NOTIFY changed)
    Q_PROPERTY(QString activeName READ activeName NOTIFY changed)
    Q_PROPERTY(QString label READ label NOTIFY changed)
    Q_PROPERTY(QString stepText READ stepText NOTIFY changed)
    Q_PROPERTY(double progress READ progress NOTIFY changed)
    Q_PROPERTY(QString speedText READ speedText NOTIFY changed)
    Q_PROPERTY(QString sizeText READ sizeText NOTIFY changed)
    Q_PROPERTY(QStringList queue READ queue NOTIFY queueChanged)
    Q_PROPERTY(QString log READ log NOTIFY logChanged)

public:
    DownloadCenter(InstallPlanner* planner, InstallRunner* runner,
                   QObject* parent = nullptr);

    bool busy() const { return !m_active.isEmpty(); }
    QString activeName() const { return m_active; }
    QString label() const { return m_label; }
    QString stepText() const { return m_stepText; }
    double progress() const { return m_progress; }   // -1 = indeterminate
    QString speedText() const { return m_speed; }
    QString sizeText() const { return m_size; }
    QStringList queue() const;
    QString log() const { return m_log; }

    Q_INVOKABLE void enqueue(const QString& name, const QString& version);
    Q_INVOKABLE void cancelActive();
    Q_INVOKABLE void removeQueued(const QString& name);
    Q_INVOKABLE bool isQueued(const QString& name) const;

signals:
    void changed();
    void queueChanged();
    void logChanged();
    // state is a GameStates::State value
    void gameStateChanged(const QString& name, int state, double progress,
                          const QString& text);
    void gameFinished(const QString& name, const QString& version);
    void gameFailed(const QString& name, const QString& error);
    void gameCancelled(const QString& name);

private:
    struct Job {
        QString name;
        QString version;
    };

    void start(const Job& job);
    void finishJob();
    void onProgress(int phase, qint64 received, qint64 total);
    void fail(const QString& error);

    InstallPlanner* m_planner;
    InstallRunner* m_runner;
    QList<Job> m_queue;
    QString m_active;
    QString m_activeVersion;
    QString m_label;
    QString m_stepText;
    QString m_speed;
    QString m_size;
    QString m_log;
    double m_progress = 0.0;
    bool m_cancelled = false;
    QElapsedTimer m_clock;
    qint64 m_lastBytes = 0;
    qint64 m_lastMs = 0;
    double m_smoothed = 0.0;
    QString m_stepLabel;
};

} // namespace Hypernucleus
