// Cross-platform stand-in for a native game or a Python interpreter.
// Prints its arguments, then behaves as told by the environment:
//   FAKEEXE_ECHO  extra line to print
//   FAKEEXE_SLEEP seconds to sleep before exiting
//   FAKEEXE_EXIT  exit code
#include <chrono>
#include <cstdio>
#include <cstdlib>
#include <thread>

int main(int argc, char** argv)
{
    std::printf("ARGS:");
    for (int i = 1; i < argc; ++i) std::printf(" %s", argv[i]);
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
