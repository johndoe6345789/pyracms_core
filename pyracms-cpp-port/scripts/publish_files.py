"""File handling for publish_manifest.py (stdlib only)."""
from __future__ import annotations

import os
import tempfile
import urllib.request

from hn_errors import ApiError


def backend_arch(arch):
    # The backend architectures table has no arm64 row; 'arm' is closest.
    if arch == "arm64":
        return os.environ.get("HN_ARM64_ARCH_NAME", "arm")
    return arch


def resolve_file(m, files_dir):
    """Find the binary named in a manifest, or download it from its url."""
    if files_dir:
        for root, _, names in os.walk(files_dir):
            if m["file"] in names:
                return os.path.join(root, m["file"])
    if m.get("url"):
        tmp = os.path.join(tempfile.mkdtemp(), m["file"])
        urllib.request.urlretrieve(m["url"], tmp)
        return tmp
    raise FileNotFoundError(
        f"{m['file']} not found in --files-dir and manifest has no url")


def attach_binary(c, type_, name, version, path, ids):
    """ids = (os_name, arch_name, os_ids, arch_ids). Idempotent (409)."""
    os_name, arch_name, os_ids, arch_ids = ids
    up = c.upload_file(path)
    fid = c.file_id(up["uuid"])
    try:
        c.request("POST",
                  f"/api/gamedep/{type_}/{name}/revisions/{version}/binaries",
                  {"osId": os_ids[os_name], "archId": arch_ids[arch_name],
                   "fileId": fid})
    except ApiError as e:
        if e.status != 409:
            raise
        print(f"  binary for {os_name}/{arch_name} already attached")
