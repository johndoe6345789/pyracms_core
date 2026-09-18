#pragma once

#include <QCoreApplication>
#include <QSettings>
#include <QStandardPaths>
#include <QTemporaryDir>

// Redirects QSettings and standard paths into a temp folder so tests never
// touch the developer's real launcher configuration.
struct TestEnv {
    TestEnv()
    {
        QCoreApplication::setOrganizationName("PyraCMS-QtTest");
        QCoreApplication::setApplicationName("Hypernucleus-QtTest");
        QStandardPaths::setTestModeEnabled(true);
        QSettings::setDefaultFormat(QSettings::IniFormat);
        QSettings::setPath(QSettings::IniFormat, QSettings::UserScope,
                           m_dir.path());
        QSettings().clear();
        qputenv("HOME", m_dir.path().toUtf8()); // default data folders
        qputenv("XDG_CONFIG_HOME", m_dir.filePath("cfg").toUtf8());
        qputenv("XDG_DATA_HOME", m_dir.filePath("data").toUtf8());
    }
    QString path(const QString& sub = QString()) const
    {
        return m_dir.filePath(sub);
    }

private:
    QTemporaryDir m_dir;
};
