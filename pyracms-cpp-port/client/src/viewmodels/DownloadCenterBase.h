#pragma once

#include <QElapsedTimer>
#include <QObject>
#include <QtQml/qqmlregistration.h>

namespace Hypernucleus {

// What the download bar shows: title, step, progress, speed, size and log.
class DownloadCenterBase : public QObject {
    Q_OBJECT
    QML_ELEMENT
    QML_UNCREATABLE("Base")
    Q_PROPERTY(bool busy READ busy NOTIFY changed)
    Q_PROPERTY(QString activeName READ activeName NOTIFY changed)
    Q_PROPERTY(QString label READ label NOTIFY changed)
    Q_PROPERTY(QString stepText READ stepText NOTIFY changed)
    Q_PROPERTY(double progress READ progress NOTIFY changed)
    Q_PROPERTY(QString speedText READ speedText NOTIFY changed)
    Q_PROPERTY(QString sizeText READ sizeText NOTIFY changed)
    Q_PROPERTY(QString log READ log NOTIFY logChanged)

public:
    using QObject::QObject;
    bool busy() const { return !m_active.isEmpty(); }
    QString activeName() const { return m_active; }
    QString label() const { return m_label; }
    QString stepText() const { return m_stepText; }
    double progress() const { return m_progress; } // -1 = indeterminate
    QString speedText() const { return m_speed; }
    QString sizeText() const { return m_size; }
    QString log() const { return m_log; }

signals:
    void changed();
    void logChanged();

protected:
    QString m_active;
    QString m_label, m_stepText, m_speed, m_size, m_log;
    double m_progress = 0.0;
    QElapsedTimer m_clock;
    qint64 m_lastBytes = 0;
    qint64 m_lastMs = 0;
    double m_smoothed = 0.0;
};

} // namespace Hypernucleus
