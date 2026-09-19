#pragma once

#include <QByteArray>
#include <QFile>
#include <QString>

// The compiled helper tests/tools/fakeexe.cpp, steered through environment
// variables, so tests need no shell scripts and run the same on every OS.
namespace FakeExe {

inline QString path() { return QStringLiteral(FAKEEXE_PATH); }

inline QByteArray bytes()
{
    QFile f(path());
    return f.open(QIODevice::ReadOnly) ? f.readAll() : QByteArray();
}

inline QString hostOs()
{
#if defined(Q_OS_WIN)
    return "windows";
#elif defined(Q_OS_MACOS)
    return "macos";
#else
    return "linux";
#endif
}

// What the next run of the helper prints, how long it lingers, how it ends.
inline void configure(const QString& echo = QString(), int exitCode = 0,
                      int sleepSeconds = 0)
{
    qputenv("FAKEEXE_ECHO", echo.toUtf8());
    qputenv("FAKEEXE_EXIT", QByteArray::number(exitCode));
    qputenv("FAKEEXE_SLEEP", QByteArray::number(sleepSeconds));
    qputenv("FAKEEXE_SELF", path().toUtf8()); // for `-m venv`
}

// Copies the helper to `target` (made executable) and returns `target`.
inline QString install(const QString& target)
{
    QFile::remove(target);
    QFile::copy(path(), target);
    QFile::setPermissions(target, QFile::permissions(target) |
                                      QFile::ExeOwner | QFile::ExeGroup |
                                      QFile::ExeOther);
    return target;
}

} // namespace FakeExe
