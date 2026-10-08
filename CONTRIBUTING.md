# Contributing

- Questions about the specification, changes to it, and conformance cases belong in
  [home-mandate/spec](https://github.com/home-mandate/spec). This
  repository only explains and publishes it.
- Translations: [TRANSLATING.md](TRANSLATING.md).
- Changes to the website: open an issue first for anything larger than a fix. Every
  change goes through a pull request; `main` is protected and only maintainers merge.

Before you open a pull request:

```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm e2e
```

Rules for the code:

- Every page works without JavaScript. Interactive parts are progressive.
- No visible text in components; all of it comes from `languages/*/messages.json`.
- CSS uses logical properties only (`margin-inline-start`, not `margin-left`).
- Nothing is loaded from other origins: no fonts, scripts, images, analytics or embeds.
- No cookies, no storage, no forms.
- Commit messages follow Conventional Commits (`feat:`, `fix:`, `docs:`, …).
