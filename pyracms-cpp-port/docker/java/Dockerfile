# Pinned by digest (renovate keeps it current).
FROM eclipse-temurin:21-jdk@sha256:92a2a4d7a928d057e7bd999c418d66c26a34eb9a0442f3ab67721c3f88110b2d
RUN useradd -m -u 10001 runner
COPY entrypoint.sh /entrypoint.sh
RUN sed -i 's/\r$//' /entrypoint.sh && chmod +x /entrypoint.sh
USER runner
WORKDIR /home/runner
ENTRYPOINT ["/entrypoint.sh"]
