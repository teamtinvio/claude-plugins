/**
 * Folder name → document type classifier.
 *
 * Uses case-insensitive prefix matching on folder names to auto-classify
 * documents into INVOICE, BILL, or BANK_STATEMENT categories.
 */

import type { DocumentType } from '../../../types.js';

/** Classification rule: regex pattern → document type. */
interface ClassifyRule {
  pattern: RegExp;
  type: DocumentType;
}

/**
 * Rules are checked in order — first match wins.
 * Patterns match against the folder name (basename only, not full path).
 */
const RULES: ClassifyRule[] = [
  // Invoice / Sales / AR
  { pattern: /^invoice/i, type: 'INVOICE' },
  { pattern: /^sales/i, type: 'INVOICE' },
  { pattern: /^ar\b/i, type: 'INVOICE' },
  { pattern: /^receivable/i, type: 'INVOICE' },
  { pattern: /^revenue/i, type: 'INVOICE' },

  // Bill / Purchase / AP
  { pattern: /^bill/i, type: 'BILL' },
  { pattern: /^purchase/i, type: 'BILL' },
  { pattern: /^expense/i, type: 'BILL' },
  { pattern: /^ap\b/i, type: 'BILL' },
  { pattern: /^payable/i, type: 'BILL' },
  { pattern: /^supplier/i, type: 'BILL' },
  { pattern: /^vendor/i, type: 'BILL' },
  { pattern: /^cost/i, type: 'BILL' },

  // Bank statements
  { pattern: /^bank/i, type: 'BANK_STATEMENT' },
  { pattern: /^statement/i, type: 'BANK_STATEMENT' },
  { pattern: /^recon/i, type: 'BANK_STATEMENT' },
];

/**
 * Classify a folder name into a document type.
 * Returns the matched DocumentType or null if no rule matches.
 */
export function classifyFolder(folderName: string): DocumentType | null {
  const name = folderName.trim();
  if (!name) return null;

  for (const rule of RULES) {
    if (rule.pattern.test(name)) {
      return rule.type;
    }
  }

  return null;
}

/** Supported file extensions per document type. */
const EXTENSIONS_INVOICE_BILL = new Set(['.pdf', '.jpg', '.jpeg', '.png']);
const EXTENSIONS_BANK = new Set(['.csv', '.ofx']);
const EXTENSIONS_SKIP = new Set(['.xlsx', '.xls', '.doc', '.docx', '.txt', '.zip', '.rar', '.7z']);

/** All supported extensions (union of invoice/bill + bank). */
const EXTENSIONS_ALL_SUPPORTED = new Set([...EXTENSIONS_INVOICE_BILL, ...EXTENSIONS_BANK]);

/**
 * Check if a file extension is supported for a given document type.
 * Returns 'supported', 'skip' (known unsupported), or 'unknown'.
 */
export function checkExtension(ext: string, docType: DocumentType | null): 'supported' | 'skip' | 'unknown' {
  const lower = ext.toLowerCase();

  if (EXTENSIONS_SKIP.has(lower)) return 'skip';

  if (docType === 'BANK_STATEMENT') {
    return EXTENSIONS_BANK.has(lower) ? 'supported' : 'skip';
  }

  if (docType === 'INVOICE' || docType === 'BILL') {
    return EXTENSIONS_INVOICE_BILL.has(lower) ? 'supported' : 'skip';
  }

  // No doc type yet — accept any supported extension
  return EXTENSIONS_ALL_SUPPORTED.has(lower) ? 'supported' : 'unknown';
}

/**
 * Infer document type from file extension alone (used when folder is unclassified).
 * Bank extensions → BANK_STATEMENT, image/PDF → null (could be invoice or bill).
 */
export function inferTypeFromExtension(ext: string): DocumentType | null {
  const lower = ext.toLowerCase();
  if (EXTENSIONS_BANK.has(lower)) return 'BANK_STATEMENT';
  return null;
}
