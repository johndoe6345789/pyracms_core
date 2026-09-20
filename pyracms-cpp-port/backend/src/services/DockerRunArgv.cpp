#include "services/DockerExecutionService.h"

namespace pyracms {

std::vector<std::string> DockerExecutionService::buildArgv(
    const std::string &image, const std::string &code) {
    return {"timeout", "-k", "5", std::to_string(kTimeoutSeconds),
            "docker", "run", "--rm",
            "--network=none",
            "--memory=512m",
            "--memory-swap=512m",
            "--cpus=1",
            "--pids-limit=256",
            "--read-only",
            "--tmpfs", "/tmp:rw,exec,nosuid,size=256m",
            "--security-opt=no-new-privileges",
            "--cap-drop=ALL",
            image, code};
}

} // namespace pyracms
