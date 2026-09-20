#pragma once

// POSIX helpers the tests use (setenv, usleep, ...) on Windows too.

#ifdef _WIN32
#include <stdlib.h>
#include <windows.h>

inline int setenv(const char *name, const char *value, int) {
    return _putenv_s(name, value);
}
inline int unsetenv(const char *name) { return _putenv_s(name, ""); }
inline void usleep(unsigned micros) { Sleep(micros / 1000); }
inline unsigned sleep(unsigned secs) {
    Sleep(secs * 1000);
    return 0;
}
#else
#include <unistd.h>
#endif
