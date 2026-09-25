#include "services/DockerExecutionService.h"

#include <cstdlib>
#include <filesystem>
#include <fstream>

namespace pyracms {

bool DockerExecutionService::inputNameOk(const std::string &name) {
    if (name.empty() || name.size() > 100 || name[0] == '.' ||
        name == "__code__")
        return false;
    for (unsigned char c : name) {
        if (c < 0x20 || c == 0x7f || c == '/' || c == '\\')
            return false;
    }
    return true;
}

std::vector<RunInput> DockerExecutionService::usableInputs(
    const std::string &language, std::vector<RunInput> inputs) {
    std::vector<RunInput> keep;
    size_t bytes = 0;
    // The runners whose entrypoint can unpack the staged files.
    bool takesInputs = language == "python" || language == "c" ||
                       language == "cpp" || language == "c++";
    for (auto &in : inputs) {
        if (!takesInputs || !inputNameOk(in.name) ||
            keep.size() >= kMaxInputFiles ||
            bytes + in.data.size() > kMaxInputBytes)
            continue;
        bytes += in.data.size();
        keep.push_back(std::move(in));
    }
    return keep;
}

// Writes the code (as __code__) and the files to a private temp directory
// the docker shim can tar up; "" when nothing could be staged.
std::string DockerExecutionService::stageInputs(
    const std::string &code, const std::vector<RunInput> &inputs) {
    namespace fs = std::filesystem;
    char tmpl[] = "/tmp/pyracms-run-XXXXXX";
    if (!mkdtemp(tmpl))
        return "";
    fs::path dir = tmpl;
    auto put = [&](const std::string &name, const std::string &data) {
        std::ofstream f(dir / name, std::ios::binary);
        f.write(data.data(), static_cast<std::streamsize>(data.size()));
        return static_cast<bool>(f);
    };
    bool ok = put("__code__", code);
    for (const auto &in : inputs)
        ok = ok && put(in.name, in.data);
    if (!ok) {
        std::error_code ec;
        fs::remove_all(dir, ec);
        return "";
    }
    return dir.string();
}

void DockerExecutionService::removeInputs(const std::string &dir) {
    std::error_code ec;
    if (!dir.empty())
        std::filesystem::remove_all(dir, ec);
}

} // namespace pyracms
