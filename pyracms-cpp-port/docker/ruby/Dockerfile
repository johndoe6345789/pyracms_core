# Pinned by digest (renovate keeps it current).
FROM ruby:3.3-slim@sha256:406485730dbf2c495294aaee6670f4985861568c88b952289c176aad0937765e
RUN useradd -m -u 10001 runner
USER runner
WORKDIR /home/runner
ENTRYPOINT ["ruby", "-e"]
