# IACTS Prayer Stand

This repository is initialized for an **IACTS Catholic prayer stand** focused on vacation prayer practice.

## What IACTS Means

- **I**: Invitation
- **A**: Adoration
- **C**: Contrition (Confession)
- **T**: Thanksgiving
- **S**: Supplication

## Current Prayers

- [Contrition Prayer](/prayers/contrition-prayer.md)
- [Prayer of Supplication](/prayers/supplication-prayer.md)

## Site Structure

This repository now includes a GitHub Pages-ready site:

- `index.html`
- `style.css`
- `script.js`
- `prayers/index.json` (manifest for prayer cards/content)

## Add a New Prayer (Modular Flow)

1. Add a markdown file under `prayers/` (for example `prayers/new-prayer.md`).
2. Add an entry to `prayers/index.json` with:
   - `title`
   - `category`
   - `path` (to the markdown file)
3. Commit and publish. The Prayer Library will automatically include it in the browser list.
4. Use the [Contribution Template](/prayers/TEMPLATE.md) for I.A.C.T.S. formatting guidance.
5. For additional teaching context, use [Four Introductory Teachings](/prayers/INTRODUCTORY-TEACHINGS.md).
