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

// A file the code opens by name (a snippet attachment), staged into the
// sandbox's working directory for the run.
struct RunInput {
    std::string name;
    std::string data;
};

class DockerExecutionService {
public:
    DockerExecutionService();

    void executeCode(const std::string &language, const std::string &code,
                     std::function<void(const ExecutionResult &)> cb) {
        executeCode(language, code, {}, std::move(cb));
    }
    // `inputs` are staged for Python, C and C++ (the runners whose
    // entrypoint can unpack them); other languages run as before.
    void executeCode(const std::string &language, const std::string &code,
                     std::vector<RunInput> inputs,
                     std::function<void(const ExecutionResult &)> cb);

    // A name a file may be staged under: one path component, no leading
    // dot, and not the reserved name the code travels under.
    static bool inputNameOk(const std::string &name);
    // The inputs a run of `language` can use: only Python/C/C++ unpack them,
    // names must pass inputNameOk, and count/size are capped.
    static std::vector<RunInput> usableInputs(const std::string &language,
                                              std::vector<RunInput> inputs);
    // Deletes a directory made by stageInputs ("" is a no-op).
    static void removeInputs(const std::string &dir);
    // Writes the code (as __code__) and the files to a private temp
    // directory the docker shim can tar up; "" if it could not.
    static std::string stageInputs(const std::string &code,
                                   const std::vector<RunInput> &inputs);

    bool isLanguageSupported(const std::string &language) const;

    // The complete argv of the sandbox run. The code is ONE argument that
    // is never parsed by a shell, so no quoting can be escaped. With
    // `inputsDir` the run also carries a label naming a directory of files
    // (plus the code, as __code__) for the docker shim to send to the
    // runner gateway; plain `docker` ignores the label.
    static std::vector<std::string>
    buildArgv(const std::string &image, const std::string &code,
              const std::string &inputsDir = "");

    static constexpr size_t kMaxCodeBytes = 100000;
    static constexpr size_t kMaxOutputBytes = 65536;
    static constexpr int kTimeoutSeconds = 30;
    // In flight (each a thread waiting on the gateway); the gateway is what
    // limits how many actually run at once, and queues the rest.
    static constexpr int kMaxConcurrent = 32;
    static constexpr size_t kMaxInputBytes = 8 * 1024 * 1024;
    static constexpr size_t kMaxInputFiles = 64;

private:
    std::unordered_map<std::string, std::string> languageImages_;
};

// Runs argv (no shell), merges stderr into stdout, returns at most
// `maxOutput` bytes and kills the process group on overflow. -1 = spawn
// failure.
int runArgv(const std::vector<std::string> &argv, size_t maxOutput,
            std::string &output);

} // namespace pyracms
