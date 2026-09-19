#pragma once

#include <functional>
#include <string>
#include <unordered_map>
#include <vector>

namespace pyracms {

struct ExecutionResult {
    int exitCode;
    std::string output;
    int executionTimeMs;
};

class DockerExecutionService {
public:
    DockerExecutionService();

    void executeCode(const std::string &language, const std::string &code,
                     std::function<void(const ExecutionResult &)> cb);

    bool isLanguageSupported(const std::string &language) const;

    // The complete argv of the sandbox run. The code is ONE argument that
    // is never parsed by a shell, so no quoting can be escaped.
    static std::vector<std::string> buildArgv(const std::string &image,
                                              const std::string &code);

    static constexpr size_t kMaxCodeBytes = 100000;
    static constexpr size_t kMaxOutputBytes = 65536;
    static constexpr int kTimeoutSeconds = 30;
    static constexpr int kMaxConcurrent = 4;

private:
    std::unordered_map<std::string, std::string> languageImages_;
};

// Runs argv (no shell), merges stderr into stdout, returns at most
// `maxOutput` bytes and kills the process group on overflow. -1 = spawn
// failure.
int runArgv(const std::vector<std::string> &argv, size_t maxOutput,
            std::string &output);

} // namespace pyracms
