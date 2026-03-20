#include "services/DockerExecutionService.h"

#include <array>
#include <chrono>
#include <cstdio>
#include <sstream>
#include <thread>

namespace pyracms {

DockerExecutionService::DockerExecutionService() {
    languageImages_ = {
        {"python",     "pyracms-runner-python"},
        {"javascript", "pyracms-runner-node"},
        {"node",       "pyracms-runner-node"},
        {"cpp",        "pyracms-runner-cpp"},
        {"c++",        "pyracms-runner-cpp"},
        {"rust",       "pyracms-runner-rust"},
        {"go",         "pyracms-runner-go"},
        {"golang",     "pyracms-runner-go"},
        {"java",       "pyracms-runner-java"},
        {"ruby",       "pyracms-runner-ruby"},
    };
}

bool DockerExecutionService::isLanguageSupported(const std::string &language) const {
    return languageImages_.find(language) != languageImages_.end();
}

void DockerExecutionService::executeCode(
    const std::string &language, const std::string &code,
    std::function<void(const ExecutionResult &)> cb) {

    auto it = languageImages_.find(language);
    if (it == languageImages_.end()) {
        cb({1, "Unsupported language: " + language, 0});
        return;
    }

    const std::string &image = it->second;

    // Run in a separate thread to avoid blocking the event loop
    std::thread([image, code, cb]() {
        auto startTime = std::chrono::steady_clock::now();

        // Escape single quotes in code for shell safety
        std::string escapedCode;
        for (char c : code) {
            if (c == '\'') {
                escapedCode += "'\\''";
            } else {
                escapedCode += c;
            }
        }

        // Build docker command with security constraints
        std::ostringstream cmdStream;
        cmdStream << "docker run --rm"
                  << " --network=none"
                  << " --memory=128m"
                  << " --cpus=0.5"
                  << " --pids-limit=64"
                  << " --read-only"
                  << " --tmpfs /tmp:rw,noexec,nosuid,size=64m"
                  << " --security-opt=no-new-privileges"
                  << " " << image
                  << " '" << escapedCode << "'"
                  << " 2>&1";

        std::string cmd = cmdStream.str();

        // Execute with timeout using the timeout command
        std::string timeoutCmd = "timeout 10 " + cmd;

        std::array<char, 4096> buffer;
        std::string output;
        int exitCode = 0;

        FILE *pipe = popen(timeoutCmd.c_str(), "r");
        if (!pipe) {
            auto endTime = std::chrono::steady_clock::now();
            int durationMs = static_cast<int>(
                std::chrono::duration_cast<std::chrono::milliseconds>(endTime - startTime).count());
            cb({1, "Failed to spawn Docker container", durationMs});
            return;
        }

        while (fgets(buffer.data(), static_cast<int>(buffer.size()), pipe) != nullptr) {
            output += buffer.data();
            // Cap output at 64KB
            if (output.size() > 65536) {
                output = output.substr(0, 65536) + "\n... output truncated (64KB limit)";
                break;
            }
        }

        int rawStatus = pclose(pipe);
        if (WIFEXITED(rawStatus)) {
            exitCode = WEXITSTATUS(rawStatus);
        } else {
            exitCode = 1;
        }

        // Exit code 124 means timeout killed the process
        if (exitCode == 124) {
            output += "\nExecution timed out (10 second limit)";
        }

        auto endTime = std::chrono::steady_clock::now();
        int durationMs = static_cast<int>(
            std::chrono::duration_cast<std::chrono::milliseconds>(endTime - startTime).count());

        cb({exitCode, output, durationMs});
    }).detach();
}

} // namespace pyracms
