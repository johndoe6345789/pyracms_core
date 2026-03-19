FROM gcc:14
RUN useradd -m runner
USER runner
WORKDIR /home/runner
COPY entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
