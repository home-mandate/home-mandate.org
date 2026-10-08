# Security

Please report vulnerabilities in this website or in the specification privately through
[GitHub private vulnerability reporting of home-mandate/spec](https://github.com/home-mandate/spec/security/advisories/new).
Do not open a public issue.

The website is static: no accounts, no forms, no cookies, no third-party resources. The
published image is signed (cosign, keyless) and carries build provenance; the server
deploys only images signed by `.github/workflows/deploy.yml` on `main` of this repository.
