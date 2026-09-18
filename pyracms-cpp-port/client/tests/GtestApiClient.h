#pragma once
#include <gtest/gtest.h>
#include <gmock/gmock.h>

#include <QCoreApplication>
#include <QSignalSpy>
#include <QJsonDocument>
#include <QJsonObject>

#include "services/ApiClient.h"

using namespace Hypernucleus;
using namespace testing;

class ApiClientTest : public ::testing::Test {
protected:
    void SetUp() override {
        // Ensure QCoreApplication exists for Qt networking
        if (!QCoreApplication::instance()) {
            static int argc = 1;
            static char appName[] = "test";
            static char* argv[] = { appName, nullptr };
            m_app = new QCoreApplication(argc, argv);
        }
        m_client = new ApiClient();
    }

    void TearDown() override {
        delete m_client;
        // Don't delete app - it persists across tests
    }

    ApiClient* m_client = nullptr;
    QCoreApplication* m_app = nullptr;
};
