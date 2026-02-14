---
name: jaz-api
version: 1.12.0
description: Complete reference for the Jaz/Juan REST API — the accounting platform backend. Use this skill whenever building, modifying, debugging, or extending any code that calls the API — including API clients, integrations, data seeding, test data, or new endpoint work. Contains every field name, response shape, error, gotcha, and edge case discovered through live production testing.
---

# Jaz API Skill

You are working with the **Jaz/Juan REST API** — the backend for Jaz (Singapore) and Juan (Philippines) accounting platforms.

## When to Use This Skill

- Writing or modifying any code that calls the Jaz API
- Building API clients, integrations, or data pipelines
- Debugging API errors (422, 400, 404, 500)
- Adding support for new Jaz API endpoints
- Reviewing code that constructs Jaz API request payloads

## Quick Reference

**Base URL**: `https://api.getjaz.com`
**Auth**: `x-jk-api-key: <key>` header on every request — key has `jk-` prefix (e.g., `jk-a1b2c3...`). NOT `Authorization: Bearer` or `x-api-key`.
**Content-Type**: `application/json` for all POST/PUT/PATCH
**All paths are prefixed**: `/api/v1/` (e.g., `https://api.getjaz.com/api/v1/invoices`)

## Critical Rules

### Identifiers & Dates
1. **All IDs are `resourceId`** — never `id`. References use `<resource>ResourceId` suffix.
2. **All transaction dates are `valueDate`** — not `issueDate`, `invoiceDate`, `date`. This is an accounting term meaning "date of economic effect."
3. **All dates are `YYYY-MM-DD` strings** — ISO datetime and epoch ms are rejected.

### Payments (Cross-Currency Aware)
4. **Payment amounts have two fields**: `paymentAmount` = bank account currency (actual cash moved), `transactionAmount` = transaction document currency (invoice/bill/credit note — amount applied to balance). For same-currency, both are equal. For FX (e.g., USD invoice paid from SGD bank at 1.35): `paymentAmount: 1350` (SGD), `transactionAmount: 1000` (USD).
5. **Payment date is `valueDate`** — not `paymentDate`, not `date`.
6. **Payment bank account is `accountResourceId`** — not `bankAccountResourceId`.
7. **Payments require 6 fields**: `paymentAmount`, `transactionAmount`, `accountResourceId`, `paymentMethod`, `reference`, `valueDate`.
8. **Payments wrapped in `{ payments: [...] }`** — array recommended. Flat objects are now auto-wrapped by the API, but array format is preferred for clarity.

### Names & Fields
9. **Line item descriptions use `name`** — not `description`.
10. **Item names**: canonical field is `internalName`, but `name` alias is accepted on POST. GET responses return both `internalName` and `name`.
11. **Tag names**: canonical field is `tagName`, but `name` alias is accepted on POST. GET responses return both `tagName` and `name`.
12. **Custom field names**: POST uses `name`, GET returns both `customFieldName` and `name`.
13. **Invoice/bill number is `reference`** — not `referenceNumber`.

### Transaction Creation
14. **`saveAsDraft`** defaults to `false` — omitting it creates a finalized transaction. Explicitly sending `saveAsDraft: true` creates a draft.
15. **If `saveAsDraft: false`** (or omitted), every lineItem MUST have `accountResourceId`.
16. **Phones MUST be E.164** — `+65XXXXXXXX` (SG), `+63XXXXXXXXXX` (PH). No spaces.

### Chart of Accounts
17. **Tax profiles pre-exist** — NEVER create them. Only GET and map.
18. **Bank accounts are CoA entries** with `accountType: "Bank Accounts"`. No separate endpoint.
19. **CoA bulk-upsert wrapper is `accounts`** — not `chartOfAccounts`.
20. **CoA POST uses `currency`** — not `currencyCode`. (Asymmetry — GET returns `currencyCode`.)
21. **CoA POST uses `classificationType`** — GET returns `accountType`. Same values.
22. **CoA code mapping: match by NAME, not code** — pre-existing accounts may have different codes. Resource IDs are the universal identifier.

### Journals & Cash
23. **Journals use `journalEntries`** with `amount` + `type: "DEBIT"|"CREDIT"` — NOT `debit`/`credit` number fields.
24. **Journals have NO `currency` field** at top level — sending it causes "Invalid request body".
25. **Cash entries use `accountResourceId`** at top level for the BANK account + `journalEntries` array for offsets.

### Credit Notes & Refunds
26. **Credit note application wraps in `credits` array** with `amountApplied` — not flat.
27. **CN refunds use `refunds` wrapper** with `refundAmount` + `refundMethod` — NOT `payments`/`paymentAmount`/`paymentMethod`.

### Inventory Items
28. **Inventory items require**: `unit` (e.g., `"pcs"`), `costingMethod` (`"FIXED"` or `"WAC"`), `cogsResourceId`, `blockInsufficientDeductions`, `inventoryAccountResourceId`. `purchaseAccountResourceId` MUST be Inventory-type CoA.
29. **Delete inventory items via `DELETE /items/:id`** — not `/inventory-items/:id`.

### Cash Transfers
30. **Cash transfers use `cashOut`/`cashIn` sub-objects** — NOT flat `fromAccountResourceId`/`toAccountResourceId`. Each: `{ accountResourceId, amount }`.

### Schedulers
31. **Scheduled invoices/bills wrap in `{ invoice: {...} }` or `{ bill: {...} }`** — not flat. Recurrence field is `repeat` (NOT `frequency`/`interval`). `saveAsDraft: false` required.
32. **Scheduled journals use FLAT structure** with `schedulerEntries` — not nested in `journal` wrapper.

### Bookmarks
33. **Bookmarks use `items` array wrapper** with `name`, `value`, `categoryCode`, `datatypeCode`.

### Custom Fields
34. **Do NOT send `appliesTo` on custom field POST** — causes "Invalid request body". Only send `name`, `type`, `printOnDocuments`.

### Reports
35. **Report field names differ by type** — this is the most error-prone area:

| Report | Required Fields |
|--------|----------------|
| Trial balance | `startDate`, `endDate` |
| Balance sheet | `primarySnapshotDate` |
| P&L | `primarySnapshotDate`, `secondarySnapshotDate` |
| General ledger | `startDate`, `endDate`, `groupBy: "ACCOUNT"` |
| Cashflow | `primaryStartDate`, `primaryEndDate` |
| Cash balance | `reportDate` |
| AR/AP report | `endDate` |
| AR/AP summary | `startDate`, `endDate` |
| Bank balance summary | `primarySnapshotDate` |
| Equity movement | `primarySnapshotStartDate`, `primarySnapshotEndDate` |

36. **Data exports use simpler field names**: P&L export uses `startDate`/`endDate` (NOT `primarySnapshotDate`). AR/AP export uses `endDate`.

### Pagination
37. **All list/search endpoints use `limit`/`offset` pagination** — NOT `page`/`size`. Default limit=100, offset=0. Max limit=1000, max offset=65536. `page`/`size` params are silently ignored. Response shape: `{ totalPages, totalElements, data: [...] }`.

### Other
38. **Currency rates use `/organization-currencies/:code/rates`** — note the HYPHENATED path (NOT `/organization/currencies`). Enable currencies first via `POST /organization/currencies`, then set rates via `POST /organization-currencies/:code/rates` with body `{ "rate": 0.74, "rateApplicableFrom": "YYYY-MM-DD" }` (see Rule 48 for direction). Cannot set rates for org base currency. Full CRUD: POST (create), GET (list), GET/:id, PUT/:id, DELETE/:id.
39. **FX invoices/bills MUST use `currency` object** — `currencyCode: "USD"` (string) is **silently ignored** (transaction created in base currency!). Use `currency: { sourceCurrency: "USD" }` to auto-fetch platform rate (ECB/FRANKFURTER), or `currency: { sourceCurrency: "USD", exchangeRate: 1.35 }` for a custom rate. Rate hierarchy: org rate → platform/ECB → transaction-level.
40. **Invoice GET uses `organizationAccountResourceId`** for line item accounts — POST uses `accountResourceId`. Request-side aliases resolve `issueDate` → `valueDate`, `bankAccountResourceId` → `accountResourceId`, etc.
41. **Scheduler GET returns `interval`** — POST uses `repeat`. (Response-side asymmetry remains.)
42. **Search sort is an object** — `{ sort: { sortBy: ["valueDate"], order: "DESC" } }`. Required when `offset` is present (even `offset: 0`).
43. **Bank records: two import methods** — Multipart CSV/OFX via `POST /magic/importBankStatementFromAttachment` (fields: `sourceFile`, `accountResourceId`, `businessTransactionType: "BANK_STATEMENT"`, `sourceType: "FILE"`). JSON via `POST /bank-records/:accountResourceId` with `{ records: [{description, netAmount, valueDate, ...}] }`.
44. **Withholding tax** on bills/supplier CNs only. Retry pattern: if `WITHHOLDING_CODE_NOT_FOUND`, strip field and retry.
45. **Known API bugs (500s)**: Contact groups PUT, custom fields PUT, capsules POST, catalogs POST, inventory balances GET — all return 500.
46. **Non-existent endpoints**: `POST /deposits` and `POST /inventory/adjustments` return 404 — these endpoints are not implemented.
47. **Attachments require PDF/PNG**: `POST /:type/:id/attachments` uses multipart `file` field but rejects `text/plain`. Use `application/pdf` or `image/png`.
48. **Currency rate direction: `rate` = functionalToSource (1 base = X foreign)** — POST `rate: 0.74` for a SGD org means 1 SGD = 0.74 USD. **If your data stores rates as "1 USD = 1.35 SGD" (sourceToFunctional), you MUST invert: `rate = 1 / 1.35 = 0.74`.** GET confirms both: `rateFunctionalToSource` (what you POSTed) and `rateSourceToFunctional` (the inverse).

### Search & Filter
49. **Search endpoint universal pattern** — All 28 `POST /*/search` endpoints share identical structure: `{ filter?, sort: { sortBy: ["field"], order: "ASC"|"DESC" }, limit: 1-1000, offset: 0-65536 }`. Sort is REQUIRED when offset is present (even `offset: 0`). Default limit: 100. `sortBy` is always an array on all endpoints (no exceptions). See `references/search-reference.md` for per-endpoint filter/sort fields.
50. **Filter operator reference** — String: `eq`, `neq`, `contains`, `in` (array, max 100), `likeIn` (array, max 100), `reg` (regex array, max 100), `isNull` (bool). Numeric: `eq`, `gt`, `gte`, `lt`, `lte`, `in`. Date (YYYY-MM-DD): `eq`, `gt`, `gte`, `lt`, `lte`, `between` (exactly 2 values). DateTime (RFC3339): same operators, converted to epoch ms internally. Boolean: `eq`. JSON: `jsonIn`, `jsonNotIn`. Logical: nest with `and`/`or`/`not` objects, or use `andGroup`/`orGroup` arrays (invoices, bills, journals, credit notes).
51. **Date format asymmetry (CRITICAL)** — Request dates: `YYYY-MM-DD` strings (all create/update and DateExpression filters). Request datetimes: RFC3339 strings (DateTimeExpression filters for `createdAt`, `updatedAt`, `approvedAt`, `submittedAt`). **ALL response dates**: `int64` epoch milliseconds — including `valueDate`, `createdAt`, `updatedAt`, `approvedAt`, `submittedAt`, `matchDate`. Convert: `new Date(epochMs).toISOString().slice(0,10)`.
52. **Field aliases on create endpoints** — Middleware transparently maps: `issueDate`/`date` → `valueDate` (invoices, bills, credit notes, journals). `name` → `tagName` (tags) or `internalName` (items). `paymentDate` → `valueDate`, `bankAccountResourceId` → `accountResourceId` (payments). `paymentAmount` → `refundAmount`, `paymentMethod` → `refundMethod` (credit note refunds). `accountType` → `classificationType`, `currencyCode` → `currency` (CoA). Canonical names always work; aliases are convenience only.
53. **All search/list responses are flat** — every search and list endpoint returns `{ totalElements, totalPages, data: [...] }` directly (no outer `data` wrapper). Access the array via `response.data`, pagination via `response.totalElements`.
54. **Scheduled endpoints support date aliases** — `txnDateAliases` middleware (mapping `issueDate`/`date` → `valueDate`) now applies to all scheduled create/update endpoints: `POST/PUT /scheduled/invoices`, `POST/PUT /scheduled/bills`, `POST/PUT /scheduled/journals`, `POST/PUT /scheduled/subscriptions`.
55. **Kebab-case URL aliases** — `capsuleTypes` endpoints also accept kebab-case paths: `/capsule-types` (list, search, CRUD). `moveTransactionCapsules` also accepts `/move-transaction-capsules`. Both camelCase and kebab-case work identically.

## Supporting Files

For detailed reference, read these files in this skill directory:

- **[references/search-reference.md](./references/search-reference.md)** — Complete search/filter/sort reference for all 28 search endpoints — per-endpoint filter fields, sort fields, operator types
- **[references/endpoints.md](./references/endpoints.md)** — Full API endpoint reference with request/response examples
- **[references/errors.md](./references/errors.md)** — Complete error catalog: every error, cause, and fix
- **[references/field-map.md](./references/field-map.md)** — Complete field name mapping (what you'd guess vs actual), date format matrix, middleware aliases
- **[references/dependencies.md](./references/dependencies.md)** — Resource creation dependencies and required order
- **[references/full-api-surface.md](./references/full-api-surface.md)** — Complete endpoint catalog (80+ endpoints), enums, search filters, limits
- **[references/feature-glossary.md](./references/feature-glossary.md)** — Business context per feature — what each feature does and why, extracted from [help.jaz.ai](https://help.jaz.ai)
- **[help-center-mirror/](./help-center-mirror/)** — Full help center content split by section (auto-generated from [help.jaz.ai](https://help.jaz.ai))

## DX Overhaul (Implemented)

The backend DX overhaul is live. Key improvements now available:
- **Request-side field aliases**: `name` → `tagName`/`internalName`, `issueDate` → `valueDate`, `bankAccountResourceId` → `accountResourceId`, and more. Both canonical and alias names are accepted.
- **Response-side aliases**: Tags, items, and custom fields return `name` alongside canonical field names (`tagName`, `internalName`, `customFieldName`).
- **`saveAsDraft` defaults to `false`**: Omitting it creates a finalized transaction. No longer required on POST.
- **`POST /items/search` available**: Advanced search with filters now works for items.
- **NormalizeToArray**: Flat payment/refund/credit objects are auto-wrapped into arrays. Array format is still recommended.
- **Nil-safe deletes**: Delete endpoints return 404 (not 500) when resource not found.

## Recommended Client Patterns

- **Serialization (Python)**: `model_dump(mode="json", by_alias=True, exclude_unset=True, exclude_none=True)`
- **Field names**: All request bodies use camelCase
- **Date serialization**: Python `date` type → `YYYY-MM-DD` strings
- **Bill payments**: Embed in bill creation body (safest). Standalone `POST /bills/{id}/payments` also works.
- **Bank records**: Use multipart `POST /magic/importBankStatementFromAttachment`
- **Scheduled bills**: Wrap as `{ status, startDate, endDate, repeat, bill: {...} }`
- **FX currency**: `currency: { sourceCurrency: "USD" }` (auto-fetches platform rate) or `currency: { sourceCurrency: "USD", exchangeRate: 1.35 }` (custom rate). **Never use `currencyCode` string** — silently ignored.
