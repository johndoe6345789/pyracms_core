FROM golang:1.22-bookworm
RUN useradd -m runner
COPY entrypoint.sh /entrypoint.sh
RUN sed -i 's/$//' /entrypoint.sh && chmod +x /entrypoint.sh
USER runner
WORKDIR /home/runner
ENTRYPOINT ["/entrypoint.sh"]
