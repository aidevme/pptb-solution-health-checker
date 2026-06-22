# TODO: Configure GitHub Discussions

Status: **Pending** — complete all steps before the first public release.

---

## Step 1 — Enable Discussions

1. Go to the repository **Settings** tab:
   `https://github.com/aidevme/pptb-solution-health-checker/settings`
2. Scroll to the **Features** section
3. Tick **Discussions**
4. Click **Save**

A **Discussions** tab will appear in the repository navigation immediately.

---

## Step 2 — Configure Categories

GitHub creates a default set of categories. Tailor them for this project:

### Delete or rename these defaults (if present)

| Default | Action |
|---|---|
| General | Keep — rename to **General** (keep as catch-all) |
| Ideas | Rename to **Feature Requests** |
| Q&A | Keep as-is |
| Show and Tell | Delete (not relevant for a tool plugin) |
| Polls | Keep or delete based on preference |

### Create these project-specific categories

Go to **Discussions → Categories → New category** (pencil icon, top right):

| Category | Format | Emoji | Purpose |
|---|---|---|---|
| **Announcements** | Announcement | 📢 | Release notes, breaking changes, project news. Maintainer-only posts. |
| **Q&A** | Question / Answer | 💬 | Usage questions, how-to, troubleshooting. Community can mark answers. |
| **Feature Requests** | Open-ended discussion | 💡 | Suggest new rules, UI improvements, integration ideas. |
| **Rule Ideas** | Open-ended discussion | 🔍 | Propose new governance rules — schema, security, ALM, flow, capacity. |
| **Bug Reports** | Open-ended discussion | 🐛 | Pre-issue triage for bugs. Convert to a GitHub Issue once confirmed. |
| **General** | Open-ended discussion | 💭 | Off-topic, introductions, general Power Platform conversation. |

### Category formats explained

| Format | Best for |
|---|---|
| **Announcement** | One-way posts. Only maintainers can start threads. |
| **Question / Answer** | Threads where one reply can be marked as the accepted answer. |
| **Open-ended discussion** | Free-form conversation without a single correct answer. |
| **Poll** | Multiple-choice community votes. |

---

## Step 3 — Pin the Welcome Discussion

Create a pinned welcome post so new visitors understand how to use Discussions.

1. Go to **Discussions → New discussion**
2. Select **Announcements** category
3. Title: `👋 Welcome to Solution Health Checker Discussions`
4. Body (paste and adapt):

```markdown
Welcome to the **PPTB Solution Health Checker** community!

This is the place to ask questions, share ideas, propose new rules, and discuss
Power Platform governance best practices.

## Where to post

| I want to… | Post in… |
|---|---|
| Ask how to use the tool | **Q&A** |
| Suggest a new governance rule | **Rule Ideas** |
| Suggest a new feature | **Feature Requests** |
| Report a bug | **Bug Reports** (we'll convert confirmed bugs to Issues) |
| Chat about Power Platform governance | **General** |

## Before opening an Issue

Please post in **Bug Reports** or **Feature Requests** first.
Once confirmed, a maintainer will convert it to a tracked GitHub Issue.

## Useful links

- [User Guide](../docs/user-guide.md)
- [Rules Reference](../RULES.md)
- [Contributing Guide](../CONTRIBUTING.md)
- [Changelog](../CHANGELOG.md)
```

5. Post the discussion
6. Click **Pin discussion** (⋯ menu → Pin to DISCUSSIONS)

---

## Step 4 — Set up Discussion Templates (optional)

GitHub does not yet support structured discussion templates the way Issues do,
but you can guide contributors with pinned posts per category.

### Pin a "How to suggest a rule" post in Rule Ideas

Title: `📋 How to suggest a new rule`

```markdown
Before posting a rule idea, check the existing [RULES.md](../RULES.md) to
avoid duplicates.

## Template — copy and fill in

**Rule title:** (e.g. "JS web resource exceeds size limit")

**Category:** schema / security / alm / flow / capacity

**Suggested severity:** fail / warn / info

**What it detects:**
> Describe the pattern or configuration that the rule should flag.

**Why it matters:**
> Explain the governance risk — performance, security, maintainability, etc.

**Remediation guidance:**
> What should a developer do to resolve the finding?

**Edge cases / exclusions:**
> Are there legitimate exceptions where this should not fire?
```

Pin this post in the **Rule Ideas** category.

---

## Step 5 — Moderator Settings

### Set up maintainers as moderators

1. Go to **Settings → Moderation options → Code review limits** (or the Discussions
   section) and configure who can post in **Announcements**
2. In the **Announcements** category settings, restrict posting to maintainers only:
   - Edit the category → tick **Limit discussion creation** to collaborators/maintainers

### Configure labels for Discussions (optional)

Labels help triage discussion threads. Create these under
`https://github.com/aidevme/pptb-solution-health-checker/labels`:

| Label | Color | Purpose |
|---|---|---|
| `discussion: rule-accepted` | `#0e8a16` (green) | Rule idea approved for implementation |
| `discussion: rule-rejected` | `#ee0701` (red) | Rule idea declined with reason |
| `discussion: converted-to-issue` | `#1d76db` (blue) | Bug confirmed and tracked as Issue |
| `discussion: needs-info` | `#e4e669` (yellow) | Waiting on more information from poster |
| `discussion: duplicate` | `#cccccc` (grey) | Already discussed elsewhere |

---

## Step 6 — Link Discussions from the README

Update `README.md` Support section to confirm the Discussions link is live:

```markdown
## 💬 Support

- **Issues**: [GitHub Issues](https://github.com/aidevme/pptb-solution-health-checker/issues)
- **Discussions**: [GitHub Discussions](https://github.com/aidevme/pptb-solution-health-checker/discussions)
- **Documentation**: [docs/](docs/)
```

The README already contains this — verify the Discussions link resolves after
enabling Discussions in Step 1.

---

## Step 7 — Community Health Files (optional but recommended)

Place these files in the repository root or a `.github/` folder. GitHub renders
them automatically on Discussions and Issues pages.

### `.github/SUPPORT.md`

```markdown
# Support

For usage questions and rule suggestions, use
[GitHub Discussions](https://github.com/aidevme/pptb-solution-health-checker/discussions).

For confirmed bugs and tracked feature work, open a
[GitHub Issue](https://github.com/aidevme/pptb-solution-health-checker/issues).

Before posting, check:
- [User Guide](docs/user-guide.md)
- [RULES.md](RULES.md)
- [Changelog](CHANGELOG.md)
```

### `.github/CODE_OF_CONDUCT.md`

GitHub provides the Contributor Covenant as a one-click option:

1. Go to **Insights → Community → Code of conduct**
2. Click **Add** next to Code of conduct
3. Select **Contributor Covenant v2.1**
4. Commit to the default branch

---

## Step 8 — GitHub Discussions API (advanced)

If you want to automate discussion management (e.g. auto-label accepted rules,
post release announcements), use the GitHub GraphQL API.

### Post a release announcement via CLI

```bash
# Requires: gh CLI authenticated, discussionCategoryId from GraphQL
gh api graphql -f query='
  mutation {
    createDiscussion(input: {
      repositoryId: "REPO_ID",
      categoryId: "CATEGORY_ID",
      title: "🚀 v0.2.0 Released",
      body: "Release notes here..."
    }) {
      discussion { url }
    }
  }
'
```

### Query existing discussions

```bash
gh api graphql -f query='
  query {
    repository(owner: "aidevme", name: "pptb-solution-health-checker") {
      discussions(first: 10) {
        nodes { title url category { name } }
      }
    }
  }
'
```

---

## Workflow: Bug report triage

```
User posts in Bug Reports discussion
  └─ Maintainer reproduces the bug
       ├─ Cannot reproduce → reply asking for more info (label: needs-info)
       └─ Confirmed
            ├─ Label: converted-to-issue
            ├─ Open a GitHub Issue linked to the discussion
            └─ Close the discussion with a link to the Issue
```

## Workflow: Rule idea triage

```
User posts in Rule Ideas discussion
  └─ Maintainer evaluates
       ├─ Duplicate → label: duplicate, link to existing thread
       ├─ Out of scope → label: rule-rejected, explain why
       └─ Accepted
            ├─ Label: rule-accepted
            ├─ Add rule to RULES.md backlog
            └─ Open a GitHub Issue to track implementation
```

---

## References

- [GitHub Docs: Enabling or disabling Discussions](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/enabling-or-disabling-github-discussions-for-a-repository)
- [GitHub Docs: Managing categories](https://docs.github.com/en/discussions/managing-discussions-for-your-community/managing-categories-for-discussions)
- [GitHub Docs: Pinning a discussion](https://docs.github.com/en/discussions/managing-discussions-for-your-community/managing-discussions#pinning-a-discussion)
- [Contributor Covenant](https://www.contributor-covenant.org/)
