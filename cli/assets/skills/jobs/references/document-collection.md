# Document Collection

Scan and classify client documents (invoices, bills, bank statements) from local directories or cloud share links (Dropbox, Google Drive, OneDrive). Outputs classified file paths with metadata — the AI agent handles uploads via the api skill.

## When to Use

- Client sends a folder of PDFs (invoices, bills, receipts) for bulk processing
- Processing bank statement CSVs/OFX files for import
- Migrating documents from file dumps (Dropbox, shared folders, email attachments)
- Processing documents from a shared Dropbox, Google Drive, or OneDrive link
- Batch-processing scanned documents during onboarding

## How It Works

```
Source (local or cloud)              CLI Output (IngestPlan)
┌───────────────┐                    ┌──────────────────────────────────────────┐
│ invoices/     │── scan + classify ─► absolutePath, documentType: INVOICE      │
│   inv-001.pdf │                    │ sizeBytes: 45230                         │
│   inv-002.jpg │                    │                                          │
│ bills/        │── scan + classify ─► absolutePath, documentType: BILL         │
│   acme-jan.pdf│                    │                                          │
│ bank/         │── scan + classify ─► absolutePath, documentType: BANK_STATEMENT│
│   dbs-jan.csv │                    │                                          │
└───────────────┘                    └──────────────────────────────────────────┘
                                                    │
                                            AI Agent reads plan,
                                        uploads via api skill (curl)
```

Cloud links are downloaded to a temp directory first, then scanned through the same pipeline.

## Folder Classification

The tool auto-classifies documents by **folder name** (case-insensitive prefix match):

| Folder name pattern | Classification |
|---|---|
| `invoice*`, `sales*`, `ar*`, `receivable*`, `revenue*` | INVOICE |
| `bill*`, `purchase*`, `expense*`, `ap*`, `payable*`, `supplier*`, `vendor*`, `cost*` | BILL |
| `bank*`, `statement*`, `recon*` | BANK_STATEMENT |
| (unknown) | UNKNOWN — skipped unless `--type` forced |

### File Extension Filters

- **Invoices/Bills**: `.pdf`, `.jpg`, `.jpeg`, `.png`
- **Bank Statements**: `.csv`, `.ofx`
- **Skipped** (with warning): `.xlsx`, `.xls`, `.doc`, `.docx`, `.txt`, `.zip`, `.rar`, `.7z`

### Traversal Rules

1. **Subfolders** — each classified by name; nested subfolders inherit from nearest classified ancestor
2. **Root-level files** — classified as UNKNOWN (no folder context)
3. **Max depth** — 10 levels (prevents runaway recursion)
4. **Hidden files/dirs** — skipped (anything starting with `.`)

## Cloud Provider Support

The `--source` flag accepts public share links from Dropbox, Google Drive, and OneDrive. Files are downloaded to a temp directory, then processed through the same scan/classify pipeline as local directories.

| Provider | File Links | Folder Links | Auth Required |
|----------|-----------|--------------|---------------|
| **Dropbox** | Direct download (dl=1 trick) | ZIP download + extract | No |
| **Google Drive** | Direct download (large file confirmation) | Not supported (requires API key) | No |
| **OneDrive/SharePoint** | MS Graph sharing API | MS Graph sharing API (first page only) | No (best-effort) |

### Cloud Limitations

- **Google Drive folders** require authentication — download manually and use a local path
- **OneDrive** is best-effort: Microsoft has restricted public link access since Feb 2025
- **Dropbox folders** download as ZIP — extracted automatically, macOS metadata stripped
- **Max file size**: 100MB per file, 500MB total for folder downloads
- **Timeout**: Default 30s (files) / 120s (folders). Override with `--timeout <ms>`

## CLI Usage

```bash
# Scan + classify local directory
clio jobs document-collection ingest --source ./client-docs/ [--json]

# Cloud sources — Dropbox, Google Drive, OneDrive
clio jobs document-collection ingest --source "https://www.dropbox.com/scl/fo/.../folder?rlkey=..." [--json]
clio jobs document-collection ingest --source "https://drive.google.com/file/d/FILE_ID/view" [--json]
clio jobs document-collection ingest --source "https://1drv.ms/f/s!..." [--json]

# With timeout for large cloud downloads
clio jobs document-collection ingest --source "https://www.dropbox.com/..." --timeout 120000 [--json]

# Force classification (skip auto-detect)
clio jobs document-collection ingest --source ./scans/ --type invoice [--json]
```

### Options

| Flag | Description |
|------|-------------|
| `--source <path\|url>` | Local directory path or public cloud share link — Dropbox, Google Drive, OneDrive (required) |
| `--type <type>` | Force all files to: `invoice`, `bill`, or `bank-statement` |
| `--timeout <ms>` | Download timeout in milliseconds (default: 30000 for files, 120000 for folders) |
| `--currency <code>` | Functional/reporting currency label |
| `--json` | Structured JSON output with absolute file paths |

### JSON Output

The `--json` output includes absolute file paths, classification, and size for each file. The AI agent uses these paths to upload via the api skill.

```json
{
  "source": "./client-docs/",
  "sourceType": "local",
  "localPath": "/tmp/client-docs",
  "folders": [{
    "folder": "invoices",
    "documentType": "INVOICE",
    "files": [{
      "path": "invoices/inv-001.pdf",
      "filename": "inv-001.pdf",
      "extension": ".pdf",
      "documentType": "INVOICE",
      "absolutePath": "/tmp/client-docs/invoices/inv-001.pdf",
      "sizeBytes": 45230,
      "confidence": "auto",
      "reason": "Folder \"invoices\" → INVOICE"
    }],
    "count": 1
  }],
  "summary": {
    "total": 1,
    "uploadable": 1,
    "needClassification": 0,
    "skipped": 0,
    "byType": { "INVOICE": 1 }
  }
}
```

For cloud sources, `localPath` points to the temp directory where files were downloaded.

## Phases (Blueprint)

When run without `ingest` subcommand, produces a 4-phase blueprint:

1. **Intake** — Identify source, validate access
2. **Scan** — Traverse directory tree, list all files
3. **Classify** — Auto-classify by folder name
4. **Review** — Present plan for user/agent action

The AI agent then uses the classified file paths to upload via the Jaz Magic API (see api skill for endpoint details).

## Relationship to Other Skills

- **api skill** — Field names, auth headers, error codes for Magic endpoints. Agent uses this to upload classified files.
- **bank-recon job** — After bank statement import, use bank-recon to match and reconcile
- **transaction-recipes** — After Magic creates draft transactions, use recipes for complex accounting patterns
