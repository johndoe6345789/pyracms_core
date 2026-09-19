#include "services/DockerExecutionService.h"

#include <csignal>
#include <sys/wait.h>
#include <unistd.h>

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

int runArgv(const std::vector<std::string> &args, size_t maxOutput,
            std::string &output) {
    std::vector<char *> argv;
    for (const auto &a : args)
        argv.push_back(const_cast<char *>(a.c_str()));
    argv.push_back(nullptr);
    int fds[2];
    if (pipe(fds) != 0)
        return -1;
    pid_t pid = fork();
    if (pid < 0) {
        close(fds[0]);
        close(fds[1]);
        return -1;
    }
    if (pid == 0) { // child: own process group, stdout+stderr -> pipe
        setpgid(0, 0);
        dup2(fds[1], 1);
        dup2(fds[1], 2);
        close(fds[0]);
        close(fds[1]);
        execvp(argv[0], argv.data());
        _exit(127);
    }
    close(fds[1]);
    char buf[4096];
    ssize_t n;
    while ((n = read(fds[0], buf, sizeof buf)) > 0) {
        output.append(buf, static_cast<size_t>(n));
        if (output.size() > maxOutput) {
            output.resize(maxOutput);
            output += "\n... output truncated (64KB limit)";
            kill(-pid, SIGKILL);
            break;
        }
    }
    close(fds[0]);
    int status = 0;
    waitpid(pid, &status, 0);
    return WIFEXITED(status) ? WEXITSTATUS(status) : 1;
}

} // namespace pyracms
