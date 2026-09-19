#pragma once

#include <QDirIterator>
#include <QFile>

#include "services/SecretStore.h"

using namespace Hypernucleus;

// A keychain that refuses everything (locked, missing, no Secret Service).
class BrokenStore : public SecretStore {
public:
    QString backendName() const override { return "broken"; }
    bool isAvailable() const override { return true; }
    bool write(const QString&, const QString&, const QString&) override
    {
        return false;
    }
    QString read(const QString&, const QString&) override { return {}; }
    bool remove(const QString&, const QString&) override { return false; }
};

// Does any file below `dir` contain `needle`?
inline bool anyFileContains(const QString& dir, const QByteArray& needle)
{
    QDirIterator it(dir, QDir::Files, QDirIterator::Subdirectories);
    while (it.hasNext()) {
        QFile f(it.next());
        if (f.open(QIODevice::ReadOnly) && f.readAll().contains(needle))
            return true;
    }
    return false;
}

