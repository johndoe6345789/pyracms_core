#pragma once

#include <functional>
#include <string>
#include <unordered_map>

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

private:
    std::unordered_map<std::string, std::string> languageImages_;
    static constexpr int TIMEOUT_SECONDS = 10;
    static constexpr int MEMORY_LIMIT_MB = 128;
    static constexpr double CPU_LIMIT = 0.5;
};

} // namespace pyracms
