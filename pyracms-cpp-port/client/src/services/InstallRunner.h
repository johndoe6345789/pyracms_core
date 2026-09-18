#pragma once

#include "domain/InstallPlan.h"

#include <QObject>

namespace Hypernucleus {

class ModuleInstaller;
class PipInstaller;

// Executes an InstallPlan step by step and reports one coherent progress
// stream for the whole batch (game + dependencies + pip packages).
class InstallRunner : public QObject {
    Q_OBJECT

public:
    enum class Phase { Download, Verify, Extract, Pip };

    InstallRunner(ModuleInstaller* installer, PipInstaller* pip,
                  QObject* parent = nullptr);

    bool isRunning() const { return m_running; }
    QString rootName() const { return m_plan.rootName; }

    void run(const InstallPlan& plan);
    void cancel();

signals:
    // stepIndex is 0-based; label describes the current step.
    void stepChanged(const QString& root, int stepIndex, int stepCount,
                     const QString& label);
    void progress(const QString& root, int phase, qint64 received,
                  qint64 total);
    void log(const QString& root, const QString& text);
    void finished(const QString& root);
    void failed(const QString& root, const QString& error);
    void cancelled(const QString& root);

private:
    void next();
    void finishWith(bool ok, const QString& error, bool wasCancelled = false);
    bool concerns(const QString& name) const;

    ModuleInstaller* m_installer;
    PipInstaller* m_pip;
    InstallPlan m_plan;
    int m_index = -1;
    bool m_running = false;
    bool m_cancelRequested = false;
};

} // namespace Hypernucleus
