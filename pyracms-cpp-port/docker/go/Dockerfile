# Pinned by digest (renovate keeps it current). Go 1.22 is EOL, so 1.24 is used.
FROM golang:1.24-bookworm@sha256:1a6d4452c65dea36aac2e2d606b01b4a029ec90cc1ae53890540ce6173ea77ac
RUN useradd -m -u 10001 runner
COPY entrypoint.sh /entrypoint.sh
RUN sed -i 's/$//' /entrypoint.sh && chmod +x /entrypoint.sh
USER runner
WORKDIR /home/runner
ENTRYPOINT ["/entrypoint.sh"]
