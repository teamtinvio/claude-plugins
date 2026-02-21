# Jaz AI

<p align="center">
  <a href="https://github.com/teamtinvio/jaz-ai/releases"><img src="https://img.shields.io/github/v/release/teamtinvio/jaz-ai?style=for-the-badge&color=blue" alt="GitHub Release"></a>
  <img src="https://img.shields.io/badge/API_rules-56-green?style=for-the-badge" alt="56 API Rules">
  <img src="https://img.shields.io/badge/skills-4-purple?style=for-the-badge" alt="4 Skills">
  <img src="https://img.shields.io/badge/recipes-16-orange?style=for-the-badge" alt="16 Recipes">
  <img src="https://img.shields.io/badge/calculators-10-red?style=for-the-badge" alt="10 Calculators">
  <img src="https://img.shields.io/badge/jobs-12-teal?style=for-the-badge" alt="12 Jobs">
  <a href="https://github.com/teamtinvio/jaz-ai/blob/main/LICENSE"><img src="https://img.shields.io/github/license/teamtinvio/jaz-ai?style=for-the-badge&color=green" alt="License"></a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/jaz-clio"><img src="https://img.shields.io/npm/v/jaz-clio?style=flat-square&logo=npm&label=CLI" alt="npm"></a>
  <a href="https://www.npmjs.com/package/jaz-clio"><img src="https://img.shields.io/npm/dm/jaz-clio?style=flat-square&label=downloads" alt="npm downloads"></a>
  <a href="https://github.com/teamtinvio/jaz-ai/stargazers"><img src="https://img.shields.io/github/stars/teamtinvio/jaz-ai?style=flat-square&logo=github" alt="GitHub stars"></a>
</p>

API reference, financial calculators, IFRS recipes, accounting jobs, data conversion playbooks, and tax computation — directly inside the AI that builders, accountants, and developers are already using to get things done.

Agent skills for [Jaz](https://jaz.ai) and [Juan](https://juan.ac) accounting platforms. Works with [Claude Code](https://claude.com/claude-code), [OpenAI Codex](https://openai.com/codex), [GitHub Copilot](https://github.com/features/copilot), [Cursor](https://cursor.com), and any tool that supports the [Agent Skills](https://agentskills.io) open standard.

## Skills

| Skill | What It Does |
|-------|-------------|
| **api** | 56 rules, full endpoint catalog, error catalog, field mapping. Agents write correct Jaz API code on the first try instead of guessing |
| **conversion** | Xero, QuickBooks, Sage, Excel migration playbook. CoA mapping, tax profiles, FX, clearing accounts, trial balance verification |
| **transaction-recipes** | 16 IFRS-compliant recipes (loans, leases, depreciation, FX reval, ECL, provisions, and more) + 10 CLI financial calculators with blueprint output |
| **jobs** | 12 accounting jobs (month/quarter/year-end close, bank recon, document collection, GST/VAT filing, payment runs, credit control, supplier recon, audit prep, FA review, statutory filing) + Singapore Form C-S tax computation with AI-guided wizard workflow |

## Installation

### Using Clio CLI (Recommended)

Works with any AI tool. Auto-detects your platform and installs to the right path.

```bash
# Install CLI globally
npm install -g jaz-clio

# Go to your project
cd /path/to/your/project

# Install all skills (auto-detects platform)
clio init

# Or install a specific skill
clio init --skill api
clio init --skill conversion
clio init --skill transaction-recipes
clio init --skill jobs

# Force a specific platform
clio init --platform claude      # → .claude/skills/
clio init --platform codex       # → .agents/skills/
clio init --platform agents      # → .agents/skills/ (universal)
```

### Claude Code Marketplace

```
/plugin marketplace add teamtinvio/jaz-ai
/plugin install jaz-ai@jaz-plugins
```

### OpenAI Codex

```
$skill-installer https://github.com/teamtinvio/jaz-ai
```

### Manual Install

Copy the skill directories into your project:

```bash
# For Codex, Copilot, Cursor (Agent Skills standard)
cp -r .agents/skills/ /path/to/your/project/.agents/skills/

# For Claude Code
cp -r .claude/skills/ /path/to/your/project/.claude/skills/
```

### Other CLI Commands

```bash
clio versions    # List available versions
clio update      # Update to latest version
clio --help      # Show all commands
```

## Usage

Skills activate automatically when you or your agent work with Jaz/Juan API code or data conversion tasks. Just describe what you need:

### API Skill

```
Create an invoice with 3 line items and 7% GST

Build a payment for invoice INV-001 in USD

Query all overdue bills with pagination

Set up chart of accounts for a Singapore company
```

### Conversion Skill

```
Convert this Xero trial balance export to Jaz

Migrate QuickBooks aged receivables to conversion invoices

Map this Excel chart of accounts to Jaz CoA structure

Verify the trial balance after conversion
```

### Transaction Recipes Skill

```
Set up a 5-year bank loan with monthly repayment schedule

Model IFRS 16 lease for a 3-year office lease at 5% IBR

Calculate ECL provision on aged receivables

Record prepaid insurance with monthly amortization via capsule
```

### Jobs Skill

```
Close the books for January 2025

Run bank reconciliation for DBS Current account

Prepare GST return for Q1 2025

Generate a payment run for all overdue bills

Prepare audit pack for FY 2025
```

### Financial Calculators & Job Tools (CLI)

```bash
clio calc loan --principal 100000 --rate 6 --term 60 --json
clio calc depreciation --cost 50000 --salvage 5000 --life 5 --method ddb --json
clio jobs bank-recon match --input bank-data.json --json
clio jobs document-collection ingest --source "https://www.dropbox.com/scl/fo/..." --json
clio jobs statutory-filing sg-cs --ya 2026 --revenue 500000 --profit 120000 --json
```

10 financial calculators, 12 job blueprints, and paired tools (bank matcher, document ingest with cloud support, SG Form C-S tax computation). Add `--json` for structured blueprint output with capsule type, journal entries, workings, and step-by-step execution plan.

Full command reference: [transaction-recipes skill](src/skills/transaction-recipes/SKILL.md) and [jobs skill](src/skills/jobs/SKILL.md).

## What's Inside

### API Skill (`api`)

| Reference | Lines | Content |
|-----------|-------|---------|
| `SKILL.md` | 162 | 56 critical rules — auth, IDs, dates, FX, payments, field aliases |
| `endpoints.md` | 1,299 | Request/response examples for every core endpoint |
| `errors.md` | 751 | Error catalog with root causes and fixes |
| `field-map.md` | 428 | Intuitive name -> actual field name mapping |
| `search-reference.md` | 714 | Filter fields, sort fields, operators for 28 search endpoints |
| `full-api-surface.md` | 699 | Complete endpoint catalog (80+), enums, limits |
| `dependencies.md` | 139 | Resource creation order (currencies -> CoA -> transactions) |
| `feature-glossary.md` | 216 | Business context per feature |

### Conversion Skill (`conversion`)

| Reference | Content |
|-----------|---------|
| `SKILL.md` | Conversion domain knowledge, clearing account pattern, FX handling |
| `mapping-rules.md` | CoA, contact, and tax code mapping rules |
| `option1-full.md` | Full conversion workflow (all transactions FY + FY-1) |
| `option2-quick.md` | Quick conversion workflow (opening balances at FYE) |
| `file-types.md` | Supported file formats and detection heuristics |
| `edge-cases.md` | Platform-specific quirks (Sage 300 preambles, Xero rounding) |
| `verification.md` | Trial balance comparison and verification checklist |
| `file-analysis.md` | Excel/CSV structure analysis and smart detection |

### Transaction Recipes Skill (`transaction-recipes`)

| Reference | Content |
|-----------|---------|
| `SKILL.md` | 16 recipes in 4 tiers, building blocks, key principles, calculator index |
| `building-blocks.md` | Capsules, schedulers, manual journals, FA, tracking tags, nano classifiers |
| `prepaid-amortization.md` | Annual insurance/rent paid upfront, monthly scheduler recognition |
| `deferred-revenue.md` | Upfront customer payment, monthly revenue recognition |
| `accrued-expenses.md` | Month-end accrual + reversal cycle using dual schedulers |
| `bank-loan.md` | Loan disbursement, amortization table, monthly installments |
| `ifrs16-lease.md` | ROU asset + lease liability unwinding (IFRS 16) |
| `declining-balance.md` | DDB/150DB with switch-to-SL logic |
| `fixed-deposit.md` | Placement, compound interest accrual, maturity (IFRS 9) |
| `hire-purchase.md` | Like IFRS 16 but depreciate over useful life |
| `asset-disposal.md` | Sale/scrap/write-off with gain/loss (IAS 16) |
| `fx-revaluation.md` | Non-AR/AP FX revaluation with Day 1 reversal (IAS 21) |
| `bad-debt-provision.md` | ECL simplified approach provision matrix (IFRS 9) |
| `employee-accruals.md` | Leave (scheduler) + bonus (manual) accruals (IAS 19) |
| `provisions.md` | PV recognition + monthly discount unwinding (IAS 37) |
| `dividend.md` | Declaration + payment (two manual journals) |
| `intercompany.md` | Mirrored invoices/bills across two entities |
| `capital-wip.md` | CIP accumulation → FA transfer on completion |


### Jobs Skill (`jobs`)

| Reference | Content |
|-----------|---------|
| `SKILL.md` | 12 accounting jobs + SG tax computation, CLI commands, wizard workflow overview |
| `building-blocks.md` | Shared concepts: accounting periods, lock dates, period verification |
| `month-end-close.md` | 5 phases, ~18 steps — the foundation for all period closes |
| `quarter-end-close.md` | Monthly + quarterly extras (GST/VAT, ECL, bonus accruals) |
| `year-end-close.md` | Quarterly + annual extras (true-ups, dividends, CYE rollover) |
| `bank-recon.md` | Match, categorize, resolve unreconciled items |
| `bank-match.md` | Bank reconciliation matcher — 5-phase cascade algorithm (1:1, N:1, 1:N, N:M) |
| `document-collection.md` | Scan and classify documents from local directories and cloud links (Dropbox, Google Drive, OneDrive) — outputs file paths for agent upload |
| `gst-vat-filing.md` | Tax ledger review, discrepancy check, filing summary |
| `payment-run.md` | Select outstanding bills by due date, process payments |
| `credit-control.md` | AR aging review, overdue chase list, bad debt assessment |
| `supplier-recon.md` | AP vs supplier statement, identify mismatches |
| `audit-prep.md` | Compile reports, schedules, reconciliations for auditor |
| `fa-review.md` | Fixed asset register review, disposal/write-off processing |
| `sg-tax/overview.md` | SG CIT framework: 17% rate, YA concept, Form C-S eligibility |
| `sg-tax/form-cs-fields.md` | 18 Form C-S + 6 C-S Lite fields with IRAS labels |
| `sg-tax/wizard-workflow.md` | Step-by-step AI agent wizard procedure |
| `sg-tax/data-extraction.md` | How to pull P&L, TB, GL, FA from Jaz API for tax |
| `sg-tax/add-backs-guide.md` | Which expenses are non-deductible + GL patterns |
| `sg-tax/capital-allowances-guide.md` | S19, S19A, S19B, S14Q rules per asset category |
| `sg-tax/ifrs16-tax-adjustment.md` | IFRS 16 lease reversal for tax purposes |
| `sg-tax/enhanced-deductions.md` | R&D (250-400%), IP, donations (250% IPC), S14Q |
| `sg-tax/exemptions-and-rebates.md` | SUTE, PTE, CIT rebate schedule by YA |
| `sg-tax/losses-and-carry-forwards.md` | Set-off order, carry-forward rules |

## Architecture

```
.claude-plugin/                  Claude Code marketplace manifest
├── plugin.json
└── marketplace.json

.agents/skills/                  Agent Skills standard (Codex, Copilot, Cursor)
├── api/            → src/skills/api/
├── conversion/     → src/skills/conversion/
├── transaction-recipes/ → src/skills/transaction-recipes/
└── jobs/           → src/skills/jobs/

.claude/skills/                  Claude Code native path
├── api/            → src/skills/api/
├── conversion/     → src/skills/conversion/
├── transaction-recipes/ → src/skills/transaction-recipes/
└── jobs/           → src/skills/jobs/

src/skills/                      Source of truth (single copy, dual discovery paths)
├── api/                         56 rules + 7 reference files
├── conversion/                  Conversion domain + 7 reference files
├── transaction-recipes/         16 recipes + 18 reference files
└── jobs/                        12 jobs + 12 job files + 10 sg-tax files

cli/                             npm CLI (jaz-clio)
├── src/commands/calc.ts         10 financial calculator commands
├── src/commands/jobs.ts         Job blueprints + nested tools
├── src/jobs/                    Job blueprints + paired tools (every job is a directory)
│   ├── month-end/               blueprint.ts
│   ├── quarter-end/             blueprint.ts
│   ├── year-end/                blueprint.ts
│   ├── bank-recon/              blueprint.ts + tools/match/
│   ├── document-collection/     blueprint.ts + tools/ingest/
│   ├── statutory-filing/        blueprint.ts + tools/sg-tax/
│   └── ...                      9 more jobs (gst-vat, payment-run, etc.)
└── assets/skills/               Bundled skill content for offline use
```

## Common API Gotchas

Mistakes the skill prevents — for agents and humans alike:

| Gotcha | Wrong | Right |
|--------|-------|-------|
| Auth header | `Authorization: Bearer ...` | `x-jk-api-key: ...` |
| ID field | `id` | `resourceId` |
| Date field | `issueDate`, `date` | `valueDate` |
| FX currency | `currencyCode: "USD"` | `currency: { sourceCurrency: "USD" }` |
| Org endpoint | `{ data: [...] }` | `{ data: { ... } }` (single object) |
| Payments | `[{ ... }]` | `{ payments: [{ ... }] }` (wrapped) |

## License

[MIT](LICENSE) - Copyright (c) 2026 Tinvio / Jaz
