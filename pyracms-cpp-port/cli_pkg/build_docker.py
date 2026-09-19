"""Build the Docker code-snippet runner images."""
import sys

from .common import CYAN, ROOT, check_prereq, error, log, run, success

RUNNERS = {
    "pyracms-runner-python": "python",
    "pyracms-runner-node": "node",
    "pyracms-runner-cpp": "cpp",
    "pyracms-runner-rust": "rust",
    "pyracms-runner-go": "go",
    "pyracms-runner-java": "java",
    "pyracms-runner-ruby": "ruby",
}


def build_docker():
    log("Building Docker code snippet runner images...", CYAN)
    if not check_prereq("docker", "docker"):
        sys.exit(1)

    docker_dir = ROOT / "docker"
    for image_name, folder in RUNNERS.items():
        folder_path = docker_dir / folder
        if not folder_path.exists():
            error(f"Docker context {folder_path} not found, "
                  f"skipping {image_name}")
            continue
        log(f"Building {image_name} from docker/{folder}/")
        run(f"docker build -t {image_name} .", cwd=folder_path)
        success(f"Built {image_name}")

    success("All Docker runner images built")
