# Image of https://home-mandate.org: the prerendered site on nginx-unprivileged.
# Built by .github/workflows/deploy.yml after "pnpm build" (build/ must exist).
# The server configuration (nginx.conf, TLS, headers) is not part of the image;
# the operator mounts it.
FROM docker.io/nginxinc/nginx-unprivileged:1.29-alpine@sha256:0c79d56aee561a1d81c63f00eee5fb5fe29279560cdc55e91425133104c7fbe6

ARG REVISION
LABEL org.opencontainers.image.title="home-mandate.org" \
      org.opencontainers.image.description="Website of the Home-Mandate Specification" \
      org.opencontainers.image.source="https://github.com/home-mandate/home-mandate.org" \
      org.opencontainers.image.url="https://home-mandate.org" \
      org.opencontainers.image.licenses="Apache-2.0 AND CC-BY-4.0" \
      org.opencontainers.image.revision="${REVISION}"

# Owned by root, readable for everyone (nginx runs as UID 101 and only reads).
COPY --chown=root:root build/ /usr/share/nginx/html/
