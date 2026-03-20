FROM rust:1.77-slim
RUN useradd -m runner
USER runner
WORKDIR /home/runner
COPY entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
