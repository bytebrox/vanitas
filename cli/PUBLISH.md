# Publish Vanitas CLI to npm

## One-time setup (you do this once)

### A) npm Automation token

1. Open https://www.npmjs.com/settings/~/tokens
2. **Generate New Token** → type **Automation** (not Classic publish with OTP every time)
3. Copy the token

### B) GitHub secret

1. Open https://github.com/bytebrox/vanitas/settings/secrets/actions
2. **New repository secret**
   - Name: `NPM_TOKEN`
   - Value: paste the npm token
3. Save

Done. You never need `npm login` on your PC for releases.

## How you publish later (only GitHub)

1. Bump version in `cli/package.json` (and keep root `package.json` / README badge in sync if you want one release number)
2. Commit + push to `main`
3. Create and push a tag that matches the CLI version:

```bash
git tag cli-vX.Y.Z
git push origin cli-vX.Y.Z
```

GitHub Actions builds the CLI and runs `npm publish`.

Check the run: https://github.com/bytebrox/vanitas/actions

Then:

```bash
npx vanitas
```

## Manual publish from Actions UI

Actions → **Publish CLI** → **Run workflow** → confirm input: `publish`

(Uses the version currently in `cli/package.json` on that branch.)

## Checklist

1. Secret `NPM_TOKEN` is set
2. Code with `cli/` is on `main`
3. Tag `cli-vX.Y.Z` matches `cli/package.json` version `X.Y.Z`

If the name `vanitas` is taken on npm, change `"name"` in `cli/package.json` to `@your-user/vanitas` and publish again.
