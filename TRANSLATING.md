# Translating home-mandate.org

Thank you for helping! The website is written in English; every other language is a
language pack in this repository. Adding one needs no programming.

The specification itself stays in English: it is the normative text. The website
explains it in plain language, and that is what gets translated.

## Add a language

1. Fork the repository and create a branch, e.g. `translation/fr`.
2. Copy `languages/en/` to `languages/<tag>/`. `<tag>` is a BCP 47 language tag:
   `fr`, `pt-BR`, `zh-Hant`, `sr-Latn`.
3. Edit `languages/<tag>/meta.json`:

   ```json
   {
     "name": "Français",
     "dir": "ltr",
     "translators": ["Your Name"]
   }
   ```

   `name` is the name of the language in that language. `dir` is `rtl` for right-to-left
   scripts (Arabic, Hebrew, …), otherwise `ltr`. `translators` is optional.
4. Translate the values in `languages/<tag>/messages.json` (texts used on every page) and
   in `languages/<tag>/pages/*.json` (one file per page). Keep the keys. Text in curly
   braces such as `{name}` or `{version}` is filled in by the website: keep it exactly,
   you may move it within the sentence.
5. Check locally (Node 24 and pnpm): `pnpm install && pnpm languages`, then `pnpm dev`
   and look at `http://localhost:5173/<tag>/`.
6. Open a pull request.

## Rules the checks enforce

- Keys starting with `site_`, `nav_`, `footer_`, `lang_`, `home_` and `common_` must be
  translated before a language is published. Other keys may be missing; the website then
  shows the English text and a note that the page is only partly translated.
- No keys that English does not have.
- The same placeholders as in English.
- Links are written `[text](target)`. Translate the text, keep the target exactly as in
  English; a translation cannot add or change links.
- No HTML, and no invisible control or formatting characters (for example bidirectional
  overrides). Write plain text; the website does the formatting.

## Keep it accurate

The website explains a security standard. If a sentence could be understood in a way the
English text does not say, prefer the more careful wording, or ask in the pull request.
Translations are published under CC BY 4.0, like the English text.
