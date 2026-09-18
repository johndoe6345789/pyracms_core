#pragma once
#include <gtest/gtest.h>
#include <gmock/gmock.h>

#include <QCoreApplication>
#include <QSettings>
#include <QSignalSpy>

#include "services/SettingsManager.h"

using namespace Hypernucleus;
using namespace testing;

class SettingsManagerTest : public ::testing::Test {
protected:
    void SetUp() override {
        if (!QCoreApplication::instance()) {
            static int argc = 1;
            static char appName[] = "test";
            static char* argv[] = { appName, nullptr };
            m_app = new QCoreApplication(argc, argv);
            m_app->setOrganizationName("PyraCMS-Test");
            m_app->setApplicationName("Hypernucleus-Test");
        }

        // Clear any existing test settings
        QSettings settings;
        settings.clear();
        settings.sync();

        m_manager = new SettingsManager();
    }

    void TearDown() override {
        delete m_manager;

        // Clean up test settings
        QSettings settings;
        settings.clear();
        settings.sync();
    }

    SettingsManager* m_manager = nullptr;
    QCoreApplication* m_app = nullptr;
};
