# Image of https://home-mandate.org: the prerendered site on nginx-unprivileged.
# Built by .github/workflows/deploy.yml after "pnpm build" (build/ must exist).
# The server configuration (nginx.conf, TLS, headers) is not part of the image;
# the operator mounts it.
FROM docker.io/nginxinc/nginx-unprivileged:1.31-alpine3.24@sha256:b5047b9b76845eac124358373c6852377c52e4b05834a47647e955dd91cb8f1e

# Alpine fixes reach its package repository before nginx rebuilds the image (brotli 1.2.1
# for CVE-2026-111497, for example), so every build installs them. The image runs as 101.
USER root
RUN apk upgrade --no-cache
USER 101

ARG REVISION
LABEL org.opencontainers.image.title="home-mandate.org" \
      org.opencontainers.image.description="Website of the Home-Mandate Specification" \
      org.opencontainers.image.source="https://github.com/home-mandate/home-mandate.org" \
      org.opencontainers.image.url="https://home-mandate.org" \
      org.opencontainers.image.licenses="Apache-2.0 AND CC-BY-4.0" \
      org.opencontainers.image.revision="${REVISION}"

# Owned by root, readable for everyone (nginx runs as UID 101 and only reads).
COPY --chown=root:root build/ /usr/share/nginx/html/
