# Clio — Command Line Interface Orchestrator for Jaz AI

Agent skills + financial calculators + tax computation for the [Jaz](https://jaz.ai) and [Juan](https://juan.ac) accounting platforms.

Works with Claude Code, OpenAI Codex, GitHub Copilot, Cursor, and any tool supporting the [Agent Skills](https://agentskills.io) open standard.

## Install

```bash
npm install -g jaz-clio
```

## Skills

Install agent skills into your project — auto-detects your AI tool.

```bash
clio init                            # All skills (auto-detect platform)
clio init --skill api                # API only
clio init --skill conversion         # Conversion only
clio init --skill transaction-recipes # Transaction recipes only
clio init --skill jobs               # Jobs only

clio init --platform claude          # Force Claude Code path
clio init --platform codex           # Force Codex/Agent Skills path
```

| Skill | What It Does |
|-------|-------------|
| **api** | 56 rules, full endpoint catalog, error catalog, field mapping |
| **conversion** | Xero, QuickBooks, Sage, Excel migration playbook |
| **transaction-recipes** | 16 IFRS-compliant recipes + 10 financial calculators |
| **jobs** | 12 accounting jobs + Singapore Form C-S tax computation |

## Financial Calculators

```bash
clio calc loan --principal 100000 --rate 6 --term 60 [--json]
clio calc lease --payment 5000 --term 36 --rate 5 [--json]
clio calc depreciation --cost 50000 --salvage 5000 --life 5 --method ddb [--json]
clio calc prepaid-expense --amount 12000 --periods 12 [--json]
clio calc deferred-revenue --amount 36000 --periods 12 [--json]
clio calc fixed-deposit --principal 100000 --rate 3.5 --term 12 [--json]
clio calc asset-disposal --cost 50000 --salvage 5000 --life 5 --acquired 2022-01-01 --disposed 2025-06-15 --proceeds 20000 [--json]
clio calc fx-reval --amount 50000 --book-rate 1.35 --closing-rate 1.38 [--json]
clio calc ecl --current 100000 --30d 50000 --60d 20000 --90d 10000 --120d 5000 --rates 0.5,2,5,10,50 [--json]
clio calc provision --amount 500000 --rate 4 --term 60 [--json]
```

Add `--json` for structured blueprint output with capsule type, journal entries, workings, and step-by-step execution plan. All calculators support `--currency <code>`.

## Job Tools

Jobs can have paired tools as nested subcommands:

```bash
# Bank reconciliation matcher (5-phase cascade: 1:1, N:1, 1:N, N:M)
clio jobs bank-recon match --input bank-data.json [--tolerance 0.01] [--date-window 14] [--json]

# Document collection — scan and classify client documents (outputs file paths for agent upload)
clio jobs document-collection ingest --source ./client-docs/ [--json]                              # local directory
clio jobs document-collection ingest --source "https://www.dropbox.com/scl/fo/..." [--json]        # Dropbox folder
clio jobs document-collection ingest --source "https://drive.google.com/file/d/..." [--json]       # Google Drive file
```

## Tax Computation (Singapore Form C-S)

Tax computation is under the `statutory-filing` job:

```bash
clio jobs statutory-filing sg-cs --input tax-data.json [--json]
clio jobs statutory-filing sg-cs --ya 2026 --revenue 500000 --profit 120000 --depreciation 15000 --exemption pte [--json]
clio jobs statutory-filing sg-ca --ya 2026 --cost 50000 --category general --acquired 2024-06-15 [--json]
```

## Other Commands

```bash
clio versions    # List available versions
clio update      # Update to latest version
clio --help      # Show all commands
```

## Documentation

- [Full documentation](https://github.com/teamtinvio/jaz-ai)
- [Jaz Help Center](https://help.jaz.ai)

## License

[MIT](https://github.com/teamtinvio/jaz-ai/blob/main/LICENSE) - Copyright (c) 2026 Tinvio / Jaz
