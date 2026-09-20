#pragma once

#include <QByteArray>
#include <QCoreApplication>
#include <QList>
#include <QSettings>
#include <QStandardPaths>
#include <QTemporaryDir>

// Redirects QSettings and standard paths into a temp folder so tests never
// touch the developer's real launcher configuration. The environment is
// restored on destruction: a leaked HOME points later tests at a deleted
// folder, and the macOS Keychain then blocks looking for a login keychain
// that is not there.
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
        set("HOME", m_dir.path()); // default data folders
        set("XDG_CONFIG_HOME", m_dir.filePath("cfg"));
        set("HYPERNUCLEUS_HOME", m_dir.filePath("hn"));
        set("APPDATA", m_dir.filePath("appdata")); // Windows
        set("XDG_DATA_HOME", m_dir.filePath("data"));
    }

    ~TestEnv()
    {
        for (int i = m_saved.size() - 1; i >= 0; --i) {
            const Saved& s = m_saved.at(i);
            if (s.had)
                qputenv(s.name.constData(), s.value);
            else
                qunsetenv(s.name.constData());
        }
    }

    TestEnv(const TestEnv&) = delete;
    TestEnv& operator=(const TestEnv&) = delete;

    QString path(const QString& sub = QString()) const
    {
        return m_dir.filePath(sub);
    }

private:
    struct Saved {
        QByteArray name;
        QByteArray value;
        bool had;
    };

    void set(const char* name, const QString& value)
    {
        m_saved.append(
            {name, qgetenv(name), qEnvironmentVariableIsSet(name)});
        qputenv(name, value.toUtf8());
    }

    QTemporaryDir m_dir;
    QList<Saved> m_saved;
};
