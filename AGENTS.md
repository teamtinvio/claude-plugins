# Jaz AI — Agent Skills

Agent skills for the [Jaz](https://jaz.ai) and [Juan](https://juan.ac) accounting platforms. Works with any tool that supports the [Agent Skills](https://agentskills.io) open standard — Claude Code, OpenAI Codex, GitHub Copilot, Cursor, Gemini CLI, and more.

## Skills

| Skill | What It Does |
|-------|-------------|
| **api** | 56 rules, full endpoint catalog, error catalog, field mapping — agents write correct Jaz API code on the first try |
| **conversion** | Xero, QuickBooks, Sage, Excel migration playbook — CoA mapping, tax profiles, FX, trial balance verification |
| **transaction-recipes** | 16 IFRS-compliant recipes (loans, leases, depreciation, FX reval, ECL, provisions) + 10 CLI financial calculators with blueprint output |
| **jobs** | 12 accounting jobs (month/quarter/year-end close, bank recon, document collection, GST/VAT, payment runs, credit control, supplier recon, audit prep, FA review, statutory filing) + Singapore Form C-S tax computation |

## Install

```bash
# CLI (recommended — auto-detects your AI tool)
npm install -g jaz-clio
clio init

# Or install a specific skill
clio init --skill api
clio init --skill conversion
```

## Skill Paths

Skills are available at both discovery paths:

- **`.agents/skills/`** — Agent Skills open standard (Codex, Copilot, Cursor, etc.)
- **`.claude/skills/`** — Claude Code native path

Both point to the same source content in `src/skills/`.

## Documentation

- [README](README.md) — Full documentation, architecture, and examples
- [help.jaz.ai](https://help.jaz.ai) — Jaz Help Center
