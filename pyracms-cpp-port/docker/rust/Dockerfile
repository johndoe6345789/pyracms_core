# Pinned by digest (renovate keeps it current). Rust 1.77 is EOL, so 1.88 is used.
FROM rust:1.88-slim@sha256:38bc5a86d998772d4aec2348656ed21438d20fcdce2795b56ca434cf21430d89
RUN useradd -m -u 10001 runner
COPY entrypoint.sh /entrypoint.sh
RUN sed -i 's/\r$//' /entrypoint.sh && chmod +x /entrypoint.sh
USER runner
WORKDIR /home/runner
ENTRYPOINT ["/entrypoint.sh"]
