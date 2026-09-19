# Pinned by digest (renovate keeps it current). Runs untrusted code: keep the toolchain supported.
FROM node:22-slim@sha256:83f487e0a63425e5b4d146fb5e5be574bcbe1b7b843d3ebafdd95eaf7767a7e5
RUN useradd -m -u 10001 runner
USER runner
WORKDIR /home/runner
ENTRYPOINT ["node", "-e"]
