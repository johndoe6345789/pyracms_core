FROM eclipse-temurin:21-jdk
RUN useradd -m runner
USER runner
WORKDIR /home/runner
COPY entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
