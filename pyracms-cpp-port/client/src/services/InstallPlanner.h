#pragma once

#include "domain/InstallPlan.h"

#include <QMap>
#include <QObject>
#include <QSet>

namespace Hypernucleus {

class EntryRepository;
class ModuleInstaller;
class PipResolver;

// Resolves everything a game needs. Python dependencies are looked up on pip
// first; names that are not on pip are taken from the PyraCMS dependency
// pages (fetched lazily, recursively, cycles tolerated).
class InstallPlanner : public QObject {
    Q_OBJECT

public:
    InstallPlanner(EntryRepository* repo, ModuleInstaller* installer,
                   PipResolver* pip, QObject* parent = nullptr);

    void setPlatform(const QString& os, const QString& arch);
    void setPreferPip(bool on) { m_preferPip = on; }

    // Empty version = latest published revision.
    void plan(const QString& gameName, const QString& version = QString());
    bool isPlanning() const { return m_active; }
    void abort();

signals:
    void planReady(const Hypernucleus::InstallPlan& plan);
    void planFailed(const QString& gameName, const QString& error);

private:
    void advance();
    void fail(const QString& error);
    void onEntryChanged(const QString& type, const QString& name);
    void onDetailFailed(const QString& type, const QString& name,
                        const QString& error);
    QList<DepRef> depsOf(const QString& moduleName) const;
    void collectFrontier(QStringList& unknown) const;
    InstallPlan build(QString* error) const;
    QList<DepRef> orderedModules() const;
    bool addDepStep(const DepRef& dep, InstallPlan& plan, QString* error) const;
    bool addGameSteps(const GameEntry& root, const RevisionInfo& rev,
                      const QStringList& walkSpecs, InstallPlan& plan,
                      QString* error) const;

    EntryRepository* m_repo;
    ModuleInstaller* m_installer;
    PipResolver* m_pip;
    QString m_os;
    QString m_arch;
    bool m_preferPip = true;

    bool m_active = false;
    int m_generation = 0;
    QString m_game;
    QString m_version;
    QMap<QString, bool> m_isPip; // dep name -> resolved via pip?
    QSet<QString> m_requested;   // detail fetches already issued
    bool m_pipCheckRunning = false;
};

} // namespace Hypernucleus
