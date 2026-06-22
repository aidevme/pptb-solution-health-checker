# TODO: Configure npm Trusted Publishing (OIDC)

This setup enables the GitHub Actions `publish-npm.yml` workflow to publish to npm
**without storing an npm token as a secret**. Instead, GitHub and npm exchange a
short-lived OIDC token at publish time.

Status: **Pending** — complete all four steps before the first release.

---

## Step 1 — Create the `npm` GitHub Actions environment

1. Go to **Settings → Environments** in the GitHub repository:
   `https://github.com/aidevme/pptb-solution-health-checker/settings/environments`
2. Click **New environment**
3. Name it exactly `npm` (must match the `environment.name` in `publish-npm.yml`)
4. Click **Configure environment**

---

## Step 2 — Restrict deployment to `main` / release tags

In the **Deployment branches and tags** section:

1. Click the **No restriction** dropdown
2. Select **Selected branches and tags**
3. Add the pattern `main` to allow publishing from the main branch
4. Optionally add `v*` to also allow publishing when a version tag is pushed

This prevents any feature branch from accidentally triggering a publish to npm.

---

## Step 3 — Require manual approval before publishing

In the **Deployment protection rules** section:

1. Tick **Required reviewers**
2. Add yourself (or a trusted maintainer) as a required reviewer
3. Click **Save protection rules**

Every publish run will pause and wait for a manual approval click before the
`npm publish` step executes — a critical safety net against accidental releases.

---

## Step 4 — Configure npm Trusted Publisher

This step is done on **npmjs.com**, not GitHub. It tells npm to accept the OIDC
token that GitHub generates during the workflow run.

1. Log in to [npmjs.com](https://www.npmjs.com)
2. Navigate to the package page:
   `https://www.npmjs.com/package/@aidevme/pptb-solution-health-checker`
3. Go to **Settings → Publishing → Granular Access Tokens → Trusted Publishers**
4. Click **Add a trusted publisher** and fill in:

   | Field | Value |
   |---|---|
   | Repository owner | `aidevme` |
   | Repository name | `pptb-solution-health-checker` |
   | Workflow filename | `publish-npm.yml` |
   | Environment name | `npm` |

5. Save the configuration

> **Note:** If the package does not exist on npm yet, publish it once manually
> with `npm publish --access public` using a classic token, then configure trusted
> publishing for all subsequent releases.

---

## How it works (no secrets needed)

```
GitHub Actions workflow run
  └─ requests OIDC token from GitHub (id-token: write permission)
       └─ presents token to npm registry
            └─ npm verifies token against the trusted publisher config
                 └─ publish proceeds — no NPM_TOKEN stored anywhere
```

The workflow already has `permissions: id-token: write` and omits
`NODE_AUTH_TOKEN`, so no changes to `publish-npm.yml` are needed after
completing these steps.

---

## Verification

After completing all steps, trigger a test run:

1. Go to **Actions → Publish to npm → Run workflow** (branch: `main`)
2. The job should pause at the `publish` step and show **Waiting for approval**
3. Approve the deployment
4. Confirm the publish step completes without a token error

---

## References

- [GitHub Actions: Using environments for deployment](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment)
- [npm: Trusted publishing via OIDC](https://docs.npmjs.com/generating-provenance-statements)
- Workflow file: [`.github/workflows/publish-npm.yml`](../../.github/workflows/publish-npm.yml)
