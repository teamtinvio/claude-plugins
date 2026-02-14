# jaz-api

[![Version](https://img.shields.io/badge/version-1.13.0-blue)](https://github.com/teamtinvio/claude-plugins)
[![License: MIT](https://img.shields.io/badge/license-MIT-green)](https://github.com/teamtinvio/claude-plugins/blob/main/LICENSE)
[![Plugin](https://img.shields.io/badge/claude--code-skill-purple)](https://github.com/teamtinvio/claude-plugins)

API intelligence for the [Jaz](https://app.jaz.ai) accounting platform.

**55 rules · 80+ endpoints · 8 reference files · 189 help center articles**

## Install

```bash
/install teamtinvio/claude-plugins
```

Works with Claude Code, Claude.ai (upload `skills/jaz-api/`), or any agent that reads markdown.

## Why This Exists

**Without the skill** — agents guess standard REST conventions and fail:
```
Authorization: Bearer <key>
POST /invoices       { issueDate, currencyCode: "USD", lineItems: [{ debit: 500 }] }
POST /payments       { amount: 100 }
PUT /chart-of-accounts  { chartOfAccounts: [...] }
```

**With the skill** — agents use the actual API contract:
```
x-jk-api-key: <key>
POST /api/v1/invoices             { valueDate, currency: { sourceCurrency: "USD" }, lineItems: [{ amount: 500, name: "..." }] }
POST /api/v1/invoice-payments     { payments: [{ paymentAmount: 100 }] }
POST /api/v1/chart-of-accounts    { accounts: [...] }
```

Covers invoices, bills, journals, credit notes, payments, bank records, FX, CoA, contacts, items, tax profiles, reports, and schedulers.

## What's Inside

| File | What it covers |
|------|---------------|
| [`SKILL.md`](skills/jaz-api/SKILL.md) | 55 rules — auth, field names, gotchas, patterns |
| [`references/endpoints.md`](skills/jaz-api/references/endpoints.md) | Request/response examples for every core endpoint |
| [`references/search-reference.md`](skills/jaz-api/references/search-reference.md) | Filter fields, sort fields, operators for all 28 search endpoints |
| [`references/errors.md`](skills/jaz-api/references/errors.md) | Every error encountered, root cause, and fix |
| [`references/field-map.md`](skills/jaz-api/references/field-map.md) | Intuitive → actual field name mappings, date format matrix |
| [`references/dependencies.md`](skills/jaz-api/references/dependencies.md) | Resource creation order (currencies → CoA → transactions → payments) |
| [`references/full-api-surface.md`](skills/jaz-api/references/full-api-surface.md) | Complete endpoint catalog (80+), enums, search filters, limits |
| [`references/feature-glossary.md`](skills/jaz-api/references/feature-glossary.md) | Business context per feature — what each feature does and why |
| [`help-center-mirror/`](skills/jaz-api/help-center-mirror/index.md) | 189 help center articles split by section |

## Quick Reference

| What agents get wrong | What actually works |
|---|---|
| `Authorization: Bearer` | `x-jk-api-key` header |
| `currencyCode: "USD"` | `currency: { sourceCurrency: "USD" }` |
| `amount: 100` on payments | `paymentAmount: 100` wrapped in `{ payments: [...] }` |
| `issueDate` | `valueDate` |
| `chartOfAccounts: [...]` | `accounts: [...]` |
| `name` on tags | `tagName` |
| Omitting `saveAsDraft` | Defaults to `false` — requires `accountResourceId` on every line item |

Full error catalog in [`references/errors.md`](skills/jaz-api/references/errors.md).

## DX Improvements

The backend DX overhaul is live:

- **Field aliases** — `name` → `tagName`/`internalName`, `issueDate` → `valueDate`, both accepted
- **Auto-wrapping** — flat payment/refund/credit objects auto-wrapped into arrays
- **Nil-safe deletes** — 404 (not 500) when resource not found
- **`saveAsDraft` defaults to `false`** — no longer required on POST
- **`POST /items/search`** — advanced search with filters now available

## Use Cases

- **Stripe → Jaz sync** — Map charges to invoices, create contacts on the fly, post payments on settlement
- **Monthly close** — Pull trial balance, flag imbalances, post adjusting journals, generate P&L and balance sheet
- **Legacy migration** — Create CoA, contacts, items, invoices, payments in dependency order across years of data
- **Multi-entity reporting** — Query SG and PH orgs, handle FX conversion, produce consolidated financials
- **Bank reconciliation** — Upload CSV statements, match transactions to open invoices/bills, post reconciling entries
- **O2C / P2P orchestration** — Full cycle: draft → approve → finalize → collect/pay → apply credits → reconcile

## Build on Jaz

Jaz is a programmable accounting platform built for the agentic era — every operation is an API call.

| Layer | What it does |
|-------|-------------|
| **REST API** | 80+ endpoints: ledger, AR/AP, banking, reporting, FX |
| **This skill** | 55 rules + field mappings + error catalog + dependency ordering, packaged as a portable reference |
| **Your agent** | Installs the skill, calls the API, runs multi-step accounting workflows autonomously |

No SDK. No integration layer. Install the skill, point at the API, build.

## Links

- [Jaz Help Center](https://help.jaz.ai)
- [API Support](mailto:api-support@jaz.ai)
- [GitHub](https://github.com/teamtinvio/claude-plugins)

## License

MIT. Copyright Tinvio.
