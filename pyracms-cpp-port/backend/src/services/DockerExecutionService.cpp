#include "services/DockerExecutionService.h"

#include <atomic>
#include <chrono>
#include <cstdlib>
#include <thread>

namespace pyracms {

DockerExecutionService::DockerExecutionService() {
    languageImages_ = {
        {"python",     "pyracms-runner-python"},
        {"javascript", "pyracms-runner-node"}, {"node", "pyracms-runner-node"},
        {"c",          "pyracms-runner-c"},
        {"cpp",        "pyracms-runner-cpp"},
        {"c++",        "pyracms-runner-cpp"},
        {"rust",       "pyracms-runner-rust"},
        {"go",         "pyracms-runner-go"},
        {"golang",     "pyracms-runner-go"},
        {"java",       "pyracms-runner-java"},
        {"ruby",       "pyracms-runner-ruby"},
    };
    // RUNNER_IMAGE_PREFIX lets a deployment pull the sandbox images from a
    // registry, e.g. ghcr.io/johndoe6345789/pyracms-runner-
    if (const char *prefix = std::getenv("RUNNER_IMAGE_PREFIX")) {
        const std::string local = "pyracms-runner-";
        for (auto &entry : languageImages_) {
            entry.second = prefix + entry.second.substr(local.size());
        }
    }
}

bool DockerExecutionService::isLanguageSupported(
    const std::string &language) const {
    return languageImages_.find(language) != languageImages_.end();
}

// Never blocks the event loop and never runs more than kMaxConcurrent
// sandboxes at once (each is a container on the host daemon).
void DockerExecutionService::executeCode(
    const std::string &language, const std::string &code,
    std::vector<RunInput> inputs,
    std::function<void(const ExecutionResult &)> cb) {
    static std::atomic<int> running{0};
    auto it = languageImages_.find(language);
    if (it == languageImages_.end()) {
        cb({1, "Unsupported language", 0});
        return;
    }
    if (code.size() > kMaxCodeBytes) {
        cb({1, "Code is too large to run", 0});
        return;
    }
    if (running.fetch_add(1) >= kMaxConcurrent) {
        running.fetch_sub(1);
        cb({1, "Too many runs in progress, try again shortly", 0});
        return;
    }
    auto staged = usableInputs(language, std::move(inputs));
    std::thread([image = it->second, code, staged, cb]() {
        auto start = std::chrono::steady_clock::now();
        std::string output;
        std::string dir = staged.empty() ? "" : stageInputs(code, staged);
        int exitCode = runArgv(buildArgv(image, code, dir), kMaxOutputBytes,
                               output);
        removeInputs(dir);
        if (exitCode < 0) {
            exitCode = 1;
            output = "Failed to start the sandbox";
        } else if (exitCode == 124 || exitCode == 137) {
            output += "\nExecution timed out (30 second limit)";
        }
        auto ms = std::chrono::duration_cast<std::chrono::milliseconds>(
            std::chrono::steady_clock::now() - start);
        running.fetch_sub(1);
        cb({exitCode, output, static_cast<int>(ms.count())});
    }).detach();
}

} // namespace pyracms
