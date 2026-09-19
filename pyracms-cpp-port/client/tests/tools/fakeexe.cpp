// Cross-platform stand-in for a native game or a Python interpreter.
// Prints its arguments, then behaves as told by the environment:
//   FAKEEXE_ECHO  extra line to print
//   FAKEEXE_SLEEP seconds to sleep before exiting
//   FAKEEXE_EXIT  exit code
#include <chrono>
#include <cstdio>
#include <cstdlib>
#include <filesystem>
#include <string>
#include <system_error>
#include <thread>

namespace fs = std::filesystem;

// `-m venv <dir>`: like a real interpreter, build <dir>/bin/python (or
// Scripts/python.exe) - here a copy of the helper named by FAKEEXE_SELF.
static void makeVenv(const std::string& dir)
{
    const char* self = std::getenv("FAKEEXE_SELF");
    if (!self || !*self) return;
    std::error_code ec;
#ifdef _WIN32
    const fs::path bin = fs::path(dir) / "Scripts";
    const fs::path exe = bin / "python.exe";
#else
    const fs::path bin = fs::path(dir) / "bin";
    const fs::path exe = bin / "python";
#endif
    fs::create_directories(bin, ec);
    fs::copy_file(self, exe, fs::copy_options::overwrite_existing, ec);
}

int main(int argc, char** argv)
{
    std::printf("ARGS:");
    for (int i = 1; i < argc; ++i) std::printf(" %s", argv[i]);
    for (int i = 2; i + 1 < argc; ++i)
        if (std::string(argv[i - 1]) == "-m" && std::string(argv[i]) == "venv")
            makeVenv(argv[i + 1]);
    std::printf("\n");
    if (const char* e = std::getenv("FAKEEXE_ECHO")) {
        if (*e) std::printf("%s\n", e);
    }
    std::fflush(stdout);
    if (const char* s = std::getenv("FAKEEXE_SLEEP")) {
        std::this_thread::sleep_for(std::chrono::seconds(std::atoi(s)));
    }
    const char* x = std::getenv("FAKEEXE_EXIT");
    return x ? std::atoi(x) : 0;
}
