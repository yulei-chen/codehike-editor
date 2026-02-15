# Publishing codehike-editor to npm

## Prerequisites

1. **npm account** – Create one at [npmjs.com/signup](https://www.npmjs.com/signup)
2. **npm CLI** – `npm install -g npm` (use a recent version)
3. **Logged in** – Run `npm login` and follow the prompts

## Before first publish

1. **Check package name availability**

   ```bash
   npm search codehike-editor
   # Or visit: https://www.npmjs.com/package/codehike-editor
   ```

   If the package exists and you don’t own it, pick a different name (e.g. `@your-username/codehike-editor`).

2. **Update version** – Bump in `package.json` or use:

   ```bash
   npm version patch   # 0.1.0 → 0.1.1
   npm version minor   # 0.1.0 → 0.2.0
   npm version major   # 0.1.0 → 1.0.0
   ```

3. **Set author (optional)** – Add to `package.json`:

   ```json
   "author": "Your Name <you@example.com>"
   ```

## Publish steps

1. **Build and verify**

   ```bash
   pnpm install
   pnpm run build
   pnpm run typecheck
   ```

2. **Dry run** – See what would be published:

   ```bash
   npm publish --dry-run
   ```

   Confirm that the listed files look correct (bin, dist, src/editor, src/templates, etc.).

3. **Publish**

   ```bash
   npm publish
   ```

   For scoped packages (e.g. `@your-org/codehike-editor`):

   ```bash
   npm publish --access public
   ```

## What happens on publish

- `prepublishOnly` runs automatically and executes `pnpm run build` (or `npm run build` if you use npm). Ensure the build works before publishing.
- Only files in the `files` array in `package.json` are included: `bin`, `dist`, `src/editor`, `src/templates`.

## Updating a published version

1. Make your changes
2. Bump the version: `npm version patch` (or `minor` / `major`)
3. Publish: `npm publish`

## Troubleshooting

| Error | Solution |
|-------|----------|
| `401 Unauthorized` | Run `npm login` |
| `403 Forbidden` | Package name may be taken or you lack permission |
| `402 Payment Required` | Need a paid npm plan for private packages; use `--access public` for public scoped packages |
| `EPERM` or permission errors | Avoid `sudo npm publish`; fix npm permissions or use a version manager (nvm, fnm) |
