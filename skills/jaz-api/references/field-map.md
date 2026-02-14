# Jaz API Field Name Map

> Complete mapping of intuitive/guessed field names to actual Jaz API field names.
> Organized by resource type. Every field verified against production API.

---

## Universal Fields

| What You'd Guess | Actual API Field | Context |
|------------------|-------------------|---------|
| `id` | `resourceId` | Every resource, every response |
| `contactId` | `contactResourceId` | POST body reference |
| `accountId` | `accountResourceId` | POST body reference |
| `bankAccountId` | `accountResourceId` | Payments, cash entries. **Alias `bankAccountResourceId` now accepted on POST.** |
| `taxProfileId` | `taxProfileResourceId` | POST body reference |
| `itemId` | `itemResourceId` | POST body reference |
| `creditNoteId` | `creditNoteResourceId` | POST body reference |

**Pattern**: References always use `<resource>ResourceId` suffix.
**Exception**: Bank account references in payments and cash entries use `accountResourceId` (NOT `bankAccountResourceId`).

---

## Date Fields

| What You'd Guess | Actual API Field | Used In |
|------------------|-------------------|---------|
| `issueDate` | `valueDate` | Invoices, bills, credit notes, journals, cash entries. **Alias `issueDate` now accepted on POST.** |
| `invoiceDate` | `valueDate` | Invoices. **Alias accepted on POST.** |
| `billDate` | `valueDate` | Bills |
| `journalDate` | `valueDate` | Journals |
| `paymentDate` | `valueDate` | Invoice/bill payments (NOT `paymentDate`!) |
| `date` (payment) | `valueDate` | Invoice/bill payments |
| `date` (bank) | `transactionDate` | Bank records |
| `asAtDate` | `endDate` | Reports (trial balance) |

**Pattern**: Transaction documents AND payments use `valueDate`. Bank records use `transactionDate`. Reports use `startDate`/`endDate`.
**CORRECTION**: Payments use `valueDate` (NOT `paymentDate` as previously documented).
**FORMAT**: All dates MUST be `YYYY-MM-DD` strings (e.g., `"2026-02-08"`). ISO datetime and epoch ms are rejected. OAS may declare `integer/int64` but strings work.

### Date Format Matrix (Request vs Response)

| Context | Direction | Format | Example |
|---------|-----------|--------|---------|
| Create/update requests | Inbound | `YYYY-MM-DD` string | `"valueDate": "2026-02-14"` |
| Search filter dates (`DateExpression`) | Inbound | `YYYY-MM-DD` string | `{ "valueDate": { "gte": "2026-01-01" } }` |
| Search filter datetimes (`DateTimeExpression`) | Inbound | RFC3339 string | `{ "createdAt": { "gte": "2026-01-01T00:00:00Z" } }` |
| **ALL response dates** | **Outbound** | **`int64` epoch milliseconds** | `"valueDate": 1707868800000` |

**CRITICAL**: ALL dates in API responses are `int64` epoch milliseconds — including `valueDate`, `createdAt`, `updatedAt`, `approvedAt`, `submittedAt`, `matchDate`, `startDate`, `endDate`, `lastScheduleDate`, `nextScheduleDate`. To convert: `new Date(epochMs).toISOString().slice(0, 10)` → `"2026-02-14"`.

**Which fields use DateExpression (YYYY-MM-DD) vs DateTimeExpression (RFC3339)**:
- `DateExpression`: `valueDate`, `dueDate`, `startDate`, `endDate`, `purchaseDate`, `matchDate`, `approvedAt`, `submittedAt`, `depreciationStartDate`, `depreciationEndDate`, `disposalValueDate`, `proratedStartDate`, `lastScheduleDate`, `nextScheduleDate`
- `DateTimeExpression`: `createdAt`, `updatedAt` (on invoices, bills, journals, custom fields)

---

### Middleware Alias Table (Complete)

These aliases are applied by middleware on POST/PUT endpoints. The alias is only used if the canonical field is absent from the request body.

| Alias | Canonical | Middleware | Applied To |
|-------|-----------|------------|-----------|
| `issueDate` | `valueDate` | `txnDateAliases` | POST/PUT: invoices, bills, customer-credit-notes, supplier-credit-notes, journals, cash-in-journals, cash-out-journals, cash-transfer-journals, scheduled/invoices, scheduled/bills, scheduled/journals, scheduled/subscriptions |
| `date` | `valueDate` | `txnDateAliases` | Same as above (all transaction and scheduled create/update endpoints) |
| `paymentDate` | `valueDate` | `paymentAliases` | POST: invoice payments, bill payments. PUT: payments |
| `bankAccountResourceId` | `accountResourceId` | `paymentAliases` | Same as above |
| `paymentAmount` | `refundAmount` | `refundAliases` | POST: customer-credit-notes refunds, supplier-credit-notes refunds |
| `paymentMethod` | `refundMethod` | `refundAliases` | Same as above |
| `name` | `tagName` | `tagAliases` | POST/PUT: tags |
| `name` | `internalName` | `itemAliases` | POST: items, inventory-items |
| `accountType` | `classificationType` | Code-level alias | POST/PUT: chart-of-accounts, bulk-upsert |
| `currencyCode` | `currency` | Code-level alias | POST: chart-of-accounts bulk-upsert |

---

## Organization & Auth

| What You'd Guess | Actual API Field | Notes |
|------------------|-------------------|-------|
| `apiKey` header | `x-jk-api-key` | Custom header (not Authorization: Bearer) |
| `org.id` | `data[0].resourceId` | Org endpoint returns a LIST |
| `org.baseCurrency` | `data[0].currency` | Not `baseCurrency` |
| `org.country` | `data[0].countryCode` | ISO 2-letter code |

---

## Chart of Accounts

| What You'd Guess | Actual API Field | Context |
|------------------|-------------------|---------|
| `chartOfAccounts` (upsert body) | `accounts` | POST bulk-upsert wrapper |
| `currencyCode` (in POST) | `currency` | POST body (GET returns `currencyCode`!) |
| `accountClass` or `accountType` | `classificationType` | POST body — uses `accountType` values |
| `type` | `accountType` | GET response field |
| `class` | `accountClass` | GET response field |
| `accountNumber` | `code` | String, can be null. **Codes differ between orgs — match by name, not code** |

### classificationType → accountType Mapping

When POSTing, `classificationType` must be one of these exact strings (same as `accountType` from GET):

| classificationType Value | accountClass (GET) |
|-------------------------|-------------------|
| `"Bank Accounts"` | Asset |
| `"Cash"` | Asset |
| `"Current Asset"` | Asset |
| `"Fixed Asset"` | Asset |
| `"Inventory"` | Asset |
| `"Current Liability"` | Liability |
| `"Non-current Liability"` | Liability |
| `"Shareholders Equity"` | Equity |
| `"Operating Revenue"` | Revenue |
| `"Other Revenue"` | Revenue |
| `"Operating Expense"` | Expense |
| `"Direct Costs"` | Expense |

---

## Contacts

| What You'd Guess | Actual API Field | Notes |
|------------------|-------------------|-------|
| `contactType: "customer"` | `customer: true` | Boolean, not enum |
| `contactType: "supplier"` | `supplier: true` | Boolean, not enum |
| `defaultCurrencyCode` | `currency` | ISO code string |
| `taxRegistrationNumber` | `taxNumber` | UEN (SG), TIN (PH) |
| `address.line1` | `addressLine1` | Top-level, NOT nested |
| `address.line2` | `addressLine2` | Top-level |
| `address.city` | `city` | Top-level |
| `address.postalCode` | `postalCode` | Top-level |
| `address.country` | `countryCode` | ISO 2-letter code, top-level |
| `displayName` | `billingName` | Required, set = name |

---

## Items

| What You'd Guess | Actual API Field | Notes |
|------------------|-------------------|-------|
| `name` | `internalName` | Display name. **Alias `name` now accepted on POST; GET returns both `internalName` and `name`.** |
| `sku` | `itemCode` | Unique code |
| `type` | `type` | `"PRODUCT"` or `"SERVICE"` |
| `sellPrice` | `salePrice` | Decimal |
| `buyPrice` | `purchasePrice` | Decimal |
| `sellAccountId` | `saleAccountResourceId` | CoA UUID |
| `buyAccountId` | `purchaseAccountResourceId` | CoA UUID |
| `sellTaxId` | `saleTaxProfileResourceId` | Tax profile UUID |
| `buyTaxId` | `purchaseTaxProfileResourceId` | Tax profile UUID |
| `sellable` | `appliesToSale` | Boolean |
| `purchasable` | `appliesToPurchase` | Boolean |
| `sellName` | `saleItemName` | REQUIRED when `appliesToSale: true` |
| `buyName` | `purchaseItemName` | REQUIRED when `appliesToPurchase: true` |

---

## Invoices / Bills

| What You'd Guess | Actual API Field | Notes |
|------------------|-------------------|-------|
| `invoiceNumber` | `reference` | User-visible number |
| `referenceNumber` | `reference` | Same field |
| `issueDate` | `valueDate` | THE invoice date |
| `description` (line item) | `name` | Line item description |
| `price` (line item) | `unitPrice` | Per-unit price |
| `qty` (line item) | `quantity` | Count |
| `taxId` (line item) | `taxProfileResourceId` | Tax profile UUID |
| `accountId` (line item) | `accountResourceId` | CoA UUID (required if !saveAsDraft) |
| `isDraft` | `saveAsDraft` | Boolean — defaults to `false`. Omitting creates a finalized transaction. |
| `currencyCode: "USD"` (string for FX) | SILENTLY IGNORED | Creates invoice in base currency! No error returned |
| `currency: "USD"` (string for FX) | CAUSES 400 ERROR | "Invalid request body" — string form rejected |
| `currency` (object form) | `currency: { sourceCurrency, exchangeRate }` | **ONLY working form** for FX transactions |

---

## Withholding Tax (Bills & Supplier Credit Notes Only)

| What You'd Guess | Actual API Field | Notes |
|---|---|---|
| `tax` | `withholdingTax` | Nested object on each line item |
| `withholdingTaxCode` | `withholdingTax.code` | String code (e.g., "WC010") |
| `withholdingTaxRate` | `withholdingTax.rate` | Numeric percentage (e.g., 10) |
| `withholdingTaxDescription` | `withholdingTax.description` | Optional description |

**Not supported on**: Invoices, customer credit notes, journals, cash entries. Only bills and supplier credit notes.

---

## Journals

| What You'd Guess | Actual API Field | Notes |
|------------------|-------------------|-------|
| `lineItems` | `journalEntries` | Array of entries |
| `lines` | `journalEntries` | Same |
| `entries` | `journalEntries` | Same |
| `debit` / `credit` (entry) | `amount` + `type` | `amount`: number, `type`: `"DEBIT"` or `"CREDIT"` (UPPERCASE) |
| `currency` (top level) | DO NOT SEND | Causes "Invalid request body" |

---

## Cash Entries

| What You'd Guess | Actual API Field | Notes |
|------------------|-------------------|-------|
| `bankAccountResourceId` | `accountResourceId` (top level) | The BANK account UUID — NOT `bankAccountResourceId` |
| `amount` (flat) | `journalEntries[].amount` | Cash entries use `journalEntries` array, same as journals |
| `description` | NOT USED | Cash entries do not have a flat `description` field |
| `bankAccount` | `accountResourceId` (top level) | Same as above |
| offset account | `journalEntries[].accountResourceId` | The offsetting account goes in `journalEntries` |
| (omit saveAsDraft) | `saveAsDraft` | **REQUIRED** — must be included on cash-in and cash-out journals |

---

## Payments

| What You'd Guess | Actual API Field | Notes |
|------------------|-------------------|-------|
| `amount` | `paymentAmount` | **Bank account currency** — actual cash moved. NOT `amount`. |
| (none) | `transactionAmount` | **Transaction document currency (invoice/bill/credit note)** — amount applied to balance. Equal to `paymentAmount` for same-currency. For FX: differs (e.g., USD invoice paid from SGD bank at 1.35 → `paymentAmount: 1350`, `transactionAmount: 1000`). |
| `bankAccountResourceId` | `accountResourceId` | Canonical is `accountResourceId`. **Alias `bankAccountResourceId` now accepted on POST.** |
| (none) | `paymentMethod` | Required: `"BANK_TRANSFER"` |
| (none) | `reference` | Required: payment reference string |
| `date` / `paymentDate` | `valueDate` | NOT `paymentDate`, NOT `date`. Must be `YYYY-MM-DD` |
| (flat object) | `{ payments: [...] }` | Must be wrapped in array |

**Cross-currency payments**: `paymentAmount` is the bank account currency amount (actual cash moved), `transactionAmount` is the invoice/bill currency amount (applied to balance). Verified via live FX testing: USD invoice ($1000) paid from SGD bank at 1.35 rate → `paymentAmount: 1350` (SGD), `transactionAmount: 1000` (USD).
**Bill payments**: Standalone `POST /bills/{id}/payments` was broken (nil pointer dereference) — fixed in backend PR #112. Embed-in-creation pattern is still a valid alternative.
**Invoice payments**: Standalone `POST /invoices/{id}/payments` works fine.
**TransactionFeeCollected**: NOT supported on bill payments (model field missing). Only invoice payments support collected fees.

---

## Tags

| What You'd Guess | Actual API Field | Notes |
|------------------|-------------------|-------|
| `name` | `tagName` | **Alias `name` now accepted on POST; GET returns both `tagName` and `name`.** |

---

## Credit Note Applications

| What You'd Guess | Actual API Field | Notes |
|------------------|-------------------|-------|
| `{ creditNoteResourceId, amount }` | `{ credits: [{ creditNoteResourceId, amountApplied }] }` | Must wrap in `credits` array |
| `amount` | `amountApplied` | NOT `amount` |

---

## Custom Fields

| What You'd Guess | Actual API Field | Notes |
|------------------|-------------------|-------|
| `name` (in GET response) | `customFieldName` | GET returns both `customFieldName` and `name` alias. |
| `name` (in POST body) | `name` | POST accepts `name`. |
| `showOnPdf` | `printOnDocuments` | Required boolean |
| `appliesTo` | DO NOT SEND | Causes "Invalid request body" |
| `type` values | `"TEXT"`, `"DATE"`, `"DROPDOWN"` | UPPERCASE strings |

---

## Bank Records

| What You'd Guess | Actual API Field | Notes |
|------------------|-------------------|-------|
| `date` | `transactionDate` | ISO date string |
| `direction` | `type` | `"CREDIT"` or `"DEBIT"` (uppercase) |
| `memo` | `description` | Free text |
| (negative amount) | `amount` (positive) + `type` | Always positive, direction via type |

**Creating bank records**: Use multipart `POST /api/v1/magic/importBankStatementFromAttachment` — the only endpoint for creating bank records. No JSON POST endpoint exists.

---

## Schedulers

| What You'd Guess | Actual API Field | Notes |
|------------------|-------------------|-------|
| `frequency` | `repeat` | Creation field. `"WEEKLY"`, `"MONTHLY"`, `"QUARTERLY"`, `"YEARLY"`. NOT `frequency` or `interval` |
| `interval` (response) | `interval` | Response field. Shows the recurrence after creation. Different name from creation! |
| (flat payload) | `{ invoice: {...} }` or `{ bill: {...} }` | Document wrapped in type key |
| `saveAsDraft: true` | `saveAsDraft: false` | MUST be false — true causes INVALID_SALE_STATUS / INVALID_PURCHASE_STATUS |

---

## Currencies

| What You'd Guess | Actual API Field | Notes |
|------------------|-------------------|-------|
| `{ currencyCode: "USD" }` | `{ currencies: ["USD"] }` | Enable endpoint — array of ISO codes |
| `/organization/currencies/:code/rates` | `/organization-currencies/:code/rates` | **Hyphenated** path for rates (NOT nested) |
| `exchangeRate` (rate POST body) | `rate` | Just `rate`, not `exchangeRate` |
| `effectiveDate` / `valueDate` / `date` | `rateApplicableFrom` | Rate start date, `YYYY-MM-DD` only |
| `expiryDate` | `rateApplicableTo` | Optional rate end date |
| `rate` (GET response) | `rateFunctionalToSource` | Base→source rate in GET response |
| `inverseRate` | `rateSourceToFunctional` | Source→base rate in GET response |

> **Rate direction cheat-sheet**: POST `rate` = GET `rateFunctionalToSource` = "1 base → X foreign". If your data is "1 foreign → X base", **invert before POSTing**.

---

## Inventory Items

| What You'd Guess | Actual API Field | Notes |
|------------------|-------------------|-------|
| `itemUnit` / `unitName` | `unit` | String, e.g., `"pcs"`, `"box"`. REQUIRED |
| `costingMethod: "FIXED_COST"` | `costingMethod: "FIXED"` | Only `"FIXED"` or `"WAC"` |
| `purchaseAccountResourceId` (any type) | `purchaseAccountResourceId` (Inventory type!) | MUST be Inventory-type CoA account |
| `DELETE /inventory-items/:id` | `DELETE /items/:id` | Delete via items endpoint, not inventory-items |

---

## Cash Transfer Journals

| What You'd Guess | Actual API Field | Notes |
|------------------|-------------------|-------|
| `fromAccountResourceId` | `cashOut.accountResourceId` | Sub-object, NOT flat |
| `toAccountResourceId` | `cashIn.accountResourceId` | Sub-object, NOT flat |
| `amount` (flat) | `cashOut.amount` / `cashIn.amount` | Amount in each sub-object |

---

## Credit Note Refunds

| What You'd Guess | Actual API Field | Notes |
|------------------|-------------------|-------|
| `payments` wrapper | `refunds` wrapper | NOT `payments` |
| `paymentAmount` | `refundAmount` | NOT `paymentAmount` |
| `paymentMethod` | `refundMethod` | NOT `paymentMethod` |

---

## Bookmarks

| What You'd Guess | Actual API Field | Notes |
|------------------|-------------------|-------|
| `{ name, url }` | `{ items: [{ name, value, categoryCode, datatypeCode }] }` | Array wrapper with 4 fields per item |
| `url` | `value` | General-purpose value field |
| `category` | `categoryCode` | Enum: `GENERAL_INFORMATION`, etc. |
| `type` | `datatypeCode` | Enum: `LINK`, `TEXT`, `NUMBER`, `BOOLEAN`, `DATE` |

---

## Scheduled Journals

| What You'd Guess | Actual API Field | Notes |
|------------------|-------------------|-------|
| `journal: { journalEntries: [...] }` | `schedulerEntries: [...]` (flat) | NOT nested like invoices/bills |
| `journalEntries` | `schedulerEntries` | Different name than regular journals |
| (nested) `reference` / `valueDate` | (top-level) `reference` / `valueDate` | Flat alongside `repeat`/`startDate`/`endDate` |

---

## Reports (All Types)

| Report | Required Fields | Notes |
|--------|----------------|-------|
| Trial balance | `startDate`, `endDate` | |
| Balance sheet | `primarySnapshotDate` | Single date |
| P&L | `primarySnapshotDate`, `secondarySnapshotDate` | |
| General ledger | `startDate`, `endDate`, `groupBy: "ACCOUNT"` | |
| Cashflow | `primaryStartDate`, `primaryEndDate` | Different from other date pairs |
| Cash balance | `reportDate` | Single date, unique field name |
| AR/AP report | `endDate` | Single date |
| AR/AP summary | `startDate`, `endDate` | |
| Bank balance summary | `primarySnapshotDate` | Same as balance sheet |
| Equity movement | `primarySnapshotStartDate`, `primarySnapshotEndDate` | Yet another pair |

## Data Exports

| Export | Required Fields | Notes |
|--------|----------------|-------|
| Trial balance | `startDate`, `endDate` | Same as generate-reports |
| P&L | `startDate`, `endDate` | DIFFERENT from generate-reports (no snapshot dates) |
| General ledger | `startDate`, `endDate`, `groupBy: "ACCOUNT"` | Same as generate-reports |
| AR/AP report | `endDate` | Same as generate-reports |

---

## Pagination

| What You'd Guess | Actual API Field | Notes |
|------------------|-------------------|-------|
| `page` | NOT SUPPORTED | Silently ignored — use `limit`/`offset` |
| `size` | NOT SUPPORTED | Silently ignored — use `limit`/`offset` |
| `pageSize` | NOT SUPPORTED | Use `limit` |
| `per_page` | NOT SUPPORTED | Use `limit` |
| `page_number` | NOT SUPPORTED | Use `offset` (item-based, not page-based) |
| (default page size) | `limit` (default: 100) | Query param for GET, JSON body for POST /search |
| (skip N items) | `offset` (default: 0) | Query param for GET, JSON body for POST /search |

**GET list endpoints**: `?limit=100&offset=0` (query params)
**POST /search endpoints**: `{ "limit": 100, "offset": 0 }` (JSON body)
**Min/max**: limit 1–1000, offset 0–65536
**Response**: `{ totalPages, totalElements, data: [...] }` — consistent across all endpoints

---

## Response Shape Quirks

| Endpoint | Response Shape | What You'd Expect |
|----------|---------------|-------------------|
| `GET /organization` | `{ data: [...] }` (list!) | `{ data: {...} }` (single) |
| `GET /organization/currencies` | `{ data: { data: [...] } }` | `{ data: [...] }` |
| `POST /chart-of-accounts/bulk-upsert` | `{ data: { resourceIds: [...] } }` | Individual results |
| `POST /organization/currencies` | `{ data: { resourceIds: [...] } }` | Confirmation object |
| `GET /invoices/{id}` line items | `organizationAccountResourceId` | `accountResourceId` (POST uses `accountResourceId`) |

---

## Recommended Serialization Patterns

Battle-tested patterns from production Jaz API clients:

| Pattern | Detail |
|---------|--------|
| Serialization | `model_dump(mode="json", by_alias=True, exclude_unset=True, exclude_none=True)` |
| Alias generator | `alias_generator=to_camel` (snake_case to camelCase) |
| Date type | Python `date` type serializes to `YYYY-MM-DD` strings |
| Bill payments | Always embedded in bill creation body, never standalone |
| Bank records | Multipart import via `importBankStatementFromAttachment` — the only endpoint |
| Scheduled bills | Wrapped as `{ repeat, startDate, endDate, bill: {...} }`. Field is `repeat` (NOT `frequency`/`interval`) |
| FX currency | MUST use `currency` OBJECT: `{ sourceCurrency: "USD", exchangeRate: 1.35 }`. String `currencyCode` is silently ignored. |

---

*Last updated: 2026-02-14 — Date format matrix: Added request vs response date format asymmetry (YYYY-MM-DD in, epoch ms out). Complete middleware alias table from Go source code. DateExpression vs DateTimeExpression field classification.*
