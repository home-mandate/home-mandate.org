# home-mandate.org

Source of the website **https://home-mandate.org** – the plain-language home of
the [Home-Mandate Specification](https://github.com/home-mandate/spec), the open, vendor-neutral
specification of what software agents may do on behalf of a household.

The specification itself, its schemas and conformance tests live in
[home-mandate/spec](https://github.com/home-mandate/spec). This repository
only explains it and serves its published files.

## What is in here

| Path | Contents |
|---|---|
| `src/` | SvelteKit site, fully prerendered (no server, no database, no cookies) |
| `languages/<tag>/` | Language packs: `meta.json` and `messages.json` per language |
| `scripts/languages.ts` | Validates the language packs, generates the language list and the Paraglide messages |
| `scripts/import-spec.ts` | Imports the release in `spec.lock.json`: checks the tag commit and every file against the specification's `conformance/manifest.json`, places each schema under its `$id` URL |
| `scripts/check-build.ts` | Checks `build/` after every build: schemas byte-equal, every language and identifier page present, `version.json`, no external resources, no inline styles or scripts, no forms |
| `static/` | Files served as they are (`robots.txt`, `.well-known/security.txt`) |
| `Dockerfile` | The published image: `build/` on `nginx-unprivileged` |
| `.github/workflows/` | `ci.yml` checks every branch and pull request; `deploy.yml` publishes after a merge to `main` |

## Develop

Node 24 and pnpm (see `packageManager` in `package.json`).

```bash
pnpm install
pnpm dev          # languages + specification import, then the dev server
pnpm lint
pnpm typecheck
pnpm test         # unit tests with coverage thresholds
pnpm build        # prerender into build/ and check it
pnpm e2e          # Playwright against the build: en and de, without JavaScript, mobile, axe
```

## Pages without JavaScript

Content pages are prerendered HTML and CSS only (`csr = false`). The language menu is a
`<details>` element with plain links. Only interactive pages opt in to JavaScript. The
Content Security Policy allows nothing from other origins, no inline styles and only
hashed scripts.

## Published files and URLs

- Every schema of the specification is served under its `$id`, e.g.
  `https://home-mandate.org/mandate/v0/mandate.schema.json`, byte-equal to the release in
  `spec.lock.json`.
- Identifier URLs used in documents (`https://home-mandate.org/mandate/v0`,
  `/audit/v0`, `/audit-checkpoint/v0`) show an explanation to browsers. Clients that
  send `Accept: application/json` or `application/schema+json` get the schema, where one
  exists (`<name>/v<N>/schema.json`).
- `/version.json` names the commit the site was built from.

To publish a new specification release, add it to `spec.lock.json` (tag and commit).

## How it is published

A merge to `main` runs `deploy.yml`: the same checks as CI, then the image is pushed by
commit tag, signed with cosign (keyless, GitHub OIDC), given build provenance, and only
then tagged `main`. The server checks the signature, the workflow identity and the commit
before it deploys anything. Nothing on the server is reachable from GitHub.

## Contributing and translating

- Translations: see [TRANSLATING.md](TRANSLATING.md). A new language needs no code change.
- Everything else: [CONTRIBUTING.md](CONTRIBUTING.md).
- Security problems: [SECURITY.md](SECURITY.md).

## Licenses

Code under Apache 2.0 ([LICENSE](LICENSE)); texts of the website and the language packs
under CC BY 4.0 ([LICENSE-docs](LICENSE-docs)). The name "Home-Mandate" and its logo are
not licensed under either license.
