#include "viewmodels/PythonSetup.h"
#include "domain/Format.h"
#include "services/ApiClient.h"
#include "services/DownloadManager.h"
#include "services/GameManager.h"
#include "services/HttpFetcher.h"
#include "services/PathManager.h"
#include "services/PipInstaller.h"
#include "services/ProcessRunner.h"
#include "services/PythonProvisioner.h"
#include "services/SettingsManager.h"
#include "viewmodels/DownloadCenter.h"

namespace Hypernucleus {

PythonSetup::PythonSetup(PathManager* paths, ApiClient* api,
                         SettingsManager* settings, PipInstaller* pip,
                         GameManager* games, DownloadCenter* dl,
                         QObject* parent)
    : QObject(parent), m_dl(dl), m_games(games)
{
    m_prov = new PythonProvisioner(
        paths, new NetworkFetcher(api->network(), this),
        new DownloadManager(api, this), new QProcessRunner(this), this);
    const auto platform = [this, settings]() {
        m_prov->setPlatform(settings->osName(), settings->archName());
    };
    platform();
    connect(settings, &SettingsBase::osNameChanged, this, platform);
    connect(settings, &SettingsBase::archNameChanged, this, platform);
    connect(pip, &PipInstaller::pythonMissing, this,
            [this](const QString& g) { request(g, Then::Install); });
    connect(games, &GameManager::pythonMissing, this,
            [this](const QString& g) { request(g, Then::Launch); });
    wire();
}

bool PythonSetup::busy() const { return m_prov->isBusy(); }

void PythonSetup::request(const QString& game, Then then)
{
    if (m_prov->isBusy()) return;
    m_game = game;
    m_then = then;
    m_prov->resolve();
    emit changed();
}

void PythonSetup::onOffer(const QString& version, qint64 size)
{
    m_text = tr("%1 needs Python, which is not installed on this computer. "
                "Download Python %2 (%3) from python-build-standalone? It "
                "is kept inside Hypernucleus and checked against its "
                "published checksum.")
                 .arg(m_game, version, Format::bytes(size));
    m_prompt = true;
    emit changed();
}

void PythonSetup::accept()
{
    if (!m_prompt) return;
    m_prompt = false;
    m_dl->beginExternal(tr("Downloading Python %1").arg(m_prov->offer().version));
    m_prov->accept();
    emit changed();
}

void PythonSetup::decline()
{
    m_prompt = false;
    m_prov->decline();
    emit changed();
}

void PythonSetup::onInstalled(const QString&)
{
    m_dl->endExternal();
    emit notice(tr("Python is ready."), false);
    emit changed();
    if (m_then == Then::Install)
        m_dl->enqueue(m_game, QString());
    else
        m_games->launchGame(m_game);
}

void PythonSetup::onEnded(const QString& text, bool error)
{
    m_prompt = false;
    m_dl->endExternal();
    if (!text.isEmpty()) emit notice(text, error);
    emit changed();
}

} // namespace Hypernucleus
