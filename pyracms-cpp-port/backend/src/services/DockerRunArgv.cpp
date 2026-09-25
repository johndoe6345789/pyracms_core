#include "services/DockerExecutionService.h"

namespace pyracms {

std::vector<std::string> DockerExecutionService::buildArgv(
    const std::string &image, const std::string &code,
    const std::string &inputsDir) {
    std::vector<std::string> argv = {
            "timeout", "-k", "5", std::to_string(kTimeoutSeconds),
            "docker", "run", "--rm",
            "--network=none",
            "--memory=512m",
            "--memory-swap=512m",
            "--cpus=1",
            "--pids-limit=256",
            "--read-only",
            "--tmpfs", "/tmp:rw,exec,nosuid,size=256m",
            "--security-opt=no-new-privileges",
            "--cap-drop=ALL"};
    if (!inputsDir.empty()) {
        argv.push_back("--label");
        argv.push_back("pyracms.inputs=" + inputsDir);
    }
    argv.push_back(image);
    argv.push_back(code);
    return argv;
}

} // namespace pyracms
