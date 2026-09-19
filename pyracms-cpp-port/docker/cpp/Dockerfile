# Pinned by digest (renovate keeps it current). Runs untrusted code: keep the toolchain supported.
FROM gcc:14@sha256:3ae7320d7dd41f446a48930e1edf4e7a41c7be5ae43a5ddbf017c53fe6495738
RUN useradd -m -u 10001 runner
COPY entrypoint.sh /entrypoint.sh
RUN sed -i 's/\r$//' /entrypoint.sh && chmod +x /entrypoint.sh
USER runner
WORKDIR /home/runner
ENTRYPOINT ["/entrypoint.sh"]
