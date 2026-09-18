#pragma once
#include <gtest/gtest.h>
#include <gmock/gmock.h>

#include <QCoreApplication>
#include <QJsonArray>
#include <QJsonObject>
#include <QSettings>
#include <QSignalSpy>
#include <QTemporaryDir>

#include "domain/InstallStateStore.h"
#include "services/ApiClient.h"
#include "services/ModuleInstaller.h"
#include "services/PathManager.h"

using namespace Hypernucleus;
using namespace testing;

class ModuleInstallerTest : public ::testing::Test {
protected:
    void SetUp() override
    {
        if (!QCoreApplication::instance()) {
            static int argc = 1;
            static char appName[] = "test";
            static char* argv[] = {appName, nullptr};
            m_app = new QCoreApplication(argc, argv);
            m_app->setOrganizationName("PyraCMS-Test");
            m_app->setApplicationName("Hypernucleus-InstallerTest");
        }
        clearSettings();
        m_apiClient = new ApiClient();
        m_pathManager = new PathManager(m_tmp.path());
        m_installer = new ModuleInstaller(m_apiClient, m_pathManager);
    }

    void TearDown() override
    {
        delete m_installer;
        delete m_pathManager;
        delete m_apiClient;
        clearSettings();
    }

    static void clearSettings()
    {
        QSettings settings;
        settings.remove("installed_modules");
        settings.sync();
    }

    // Installed state lives in installed.json inside the (temporary) data
    // folder; the installer reads it on construction.
    void writeInstalled(const QString& name, const QString& version)
    {
        InstallStateStore store(m_pathManager->stateFile());
        store.load();
        InstallRecord r;
        r.name = name;
        r.version = version;
        r.type = "game";
        r.path = m_pathManager->gameDir(name);
        QDir().mkpath(r.path);
        store.set(r);
        store.save();
    }

    QTemporaryDir m_tmp;
    ApiClient* m_apiClient = nullptr;
    PathManager* m_pathManager = nullptr;
    ModuleInstaller* m_installer = nullptr;
    QCoreApplication* m_app = nullptr;
};
