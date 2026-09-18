"""Multipart/form-data encoding for file uploads (stdlib only)."""
from __future__ import annotations

import mimetypes
import os
import uuid


def encode_file(path, field="file"):
    """Returns (body_bytes, content_type_header) for one file."""
    boundary = uuid.uuid4().hex
    name = os.path.basename(path)
    ctype = mimetypes.guess_type(name)[0] or "application/octet-stream"
    head = (f"--{boundary}\r\nContent-Disposition: form-data; "
            f"name=\"{field}\"; filename=\"{name}\"\r\n"
            f"Content-Type: {ctype}\r\n\r\n").encode()
    tail = f"\r\n--{boundary}--\r\n".encode()
    with open(path, "rb") as f:  # binaries are tens of MB; fine in memory
        data = head + f.read() + tail
    return data, f"multipart/form-data; boundary={boundary}"
