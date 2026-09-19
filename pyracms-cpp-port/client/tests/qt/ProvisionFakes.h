#pragma once

#include <QDir>
#include <QFile>
#include <QFileInfo>
#include <QTimer>

#include "services/HttpFetcher.h"
#include "services/ProcessRunner.h"

// GitHub and tar replaced by fakes; the archive itself comes from MiniHttp.
struct FakeFetcher : Hypernucleus::HttpFetcher {
    QHash<QString, QByteArray> bodies;
    QStringList requested;
    void get(const QUrl& url, Done done) override
    {
        requested << url.toString();
        const bool ok = bodies.contains(url.toString());
        const QByteArray b = bodies.value(url.toString());
        QTimer::singleShot(0, this, [ok, b, done]() {
            done(ok, b, ok ? QString() : QStringLiteral("404"));
        });
    }
};

// "Extracts" by creating the interpreter where PythonLocator looks for it.
struct FakeTar : Hypernucleus::ProcessRunner {
    int exitCode = 0;
    QStringList args;
    QString workDir;
    bool running = false;
    void start(const QString&, const QStringList& a, const QString& dir,
               const QProcessEnvironment&) override
    {
        args = a;
        workDir = dir;
        running = true;
#ifdef Q_OS_WIN
        const QString exe = "python-staging/python/python.exe";
#else
        const QString exe = "python-staging/python/bin/python3";
#endif
        if (exitCode == 0) {
            QDir().mkpath(QFileInfo(dir + "/" + exe).absolutePath());
            QFile f(dir + "/" + exe);
            f.open(QIODevice::WriteOnly);
        }
        QTimer::singleShot(0, this, [this]() {
            running = false;
            Hypernucleus::ProcessResult r;
            r.started = true;
            r.exitCode = exitCode;
            r.output = exitCode ? "tar: bad archive" : "";
            emit finished(r);
        });
    }
    void cancel() override {}
    bool isRunning() const override { return running; }
};
