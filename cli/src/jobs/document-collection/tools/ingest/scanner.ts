/**
 * Local filesystem scanner for the document-collection ingest tool.
 *
 * Recursively traverses a directory, classifies files by folder name,
 * and produces an IngestPlan (dry-run output).
 */

import { readdirSync, statSync } from 'node:fs';
import { join, basename, extname, relative, resolve } from 'node:path';
import type { DocumentType, FileClassification, FolderSummary, IngestPlan } from '../../../types.js';
import { classifyFolder, checkExtension } from './classify.js';

/** Max recursion depth to prevent runaway traversal. */
const MAX_DEPTH = 10;

export interface ScanOptions {
  /** Force all files to a specific document type (--type flag). */
  forceType?: DocumentType;
  /** Max depth for recursion. */
  maxDepth?: number;
}

/**
 * Scan a local directory and produce an IngestPlan.
 *
 * Classification logic:
 * 1. If --type is forced, all supported files get that type.
 * 2. Otherwise, classify each subfolder by name (prefix match).
 * 3. Files in the root (no subfolder) are classified as UNKNOWN.
 * 4. Nested subfolders (depth > 1) inherit from nearest classified ancestor.
 */
export function scanLocalDirectory(sourcePath: string, opts: ScanOptions = {}): IngestPlan {
  const base = resolve(sourcePath);
  const maxDepth = opts.maxDepth ?? MAX_DEPTH;
  const files: FileClassification[] = [];

  scanDir(base, base, null, opts.forceType ?? null, 0, maxDepth, files);

  // Group files by folder
  const folderMap = new Map<string, FileClassification[]>();
  for (const f of files) {
    const existing = folderMap.get(f.folder);
    if (existing) {
      existing.push(f);
    } else {
      folderMap.set(f.folder, [f]);
    }
  }

  const folders: FolderSummary[] = [];
  for (const [folder, folderFiles] of folderMap) {
    // Determine folder-level doc type (majority of non-SKIPPED files)
    const uploadable = folderFiles.filter(f => f.documentType !== 'SKIPPED' && f.documentType !== 'UNKNOWN');
    const docType: DocumentType | 'UNKNOWN' = uploadable.length > 0
      ? uploadable[0].documentType as DocumentType
      : 'UNKNOWN';

    folders.push({
      folder,
      documentType: docType,
      files: folderFiles,
      count: folderFiles.length,
    });
  }

  // Sort folders: classified first, UNKNOWN last
  folders.sort((a, b) => {
    if (a.documentType === 'UNKNOWN' && b.documentType !== 'UNKNOWN') return 1;
    if (a.documentType !== 'UNKNOWN' && b.documentType === 'UNKNOWN') return -1;
    return a.folder.localeCompare(b.folder);
  });

  // Build summary
  let total = 0;
  let uploadable = 0;
  let needClassification = 0;
  let skipped = 0;
  const byType: Record<string, number> = {};

  for (const f of files) {
    total++;
    if (f.documentType === 'SKIPPED') {
      skipped++;
    } else if (f.documentType === 'UNKNOWN') {
      needClassification++;
    } else {
      uploadable++;
      byType[f.documentType] = (byType[f.documentType] ?? 0) + 1;
    }
  }

  return {
    source: base,
    sourceType: 'local',
    localPath: base,
    folders,
    summary: { total, uploadable, needClassification, skipped, byType },
  };
}

/**
 * Recursive directory scanner.
 */
function scanDir(
  rootPath: string,
  dirPath: string,
  inheritedType: DocumentType | null,
  forceType: DocumentType | null,
  depth: number,
  maxDepth: number,
  out: FileClassification[],
): void {
  if (depth > maxDepth) return;

  let entries: string[];
  try {
    entries = readdirSync(dirPath);
  } catch {
    return; // Skip inaccessible directories
  }

  const relDir = relative(rootPath, dirPath) || '.';

  // Classify this folder if not root and not forced
  const folderName = basename(dirPath);
  const folderType = forceType ?? (depth > 0 ? (classifyFolder(folderName) ?? inheritedType) : inheritedType);

  for (const entry of entries) {
    // Skip hidden files/dirs
    if (entry.startsWith('.')) continue;

    const fullPath = join(dirPath, entry);
    let stat;
    try {
      stat = statSync(fullPath);
    } catch {
      continue; // Skip inaccessible entries
    }

    if (stat.isDirectory()) {
      scanDir(rootPath, fullPath, folderType, forceType, depth + 1, maxDepth, out);
    } else if (stat.isFile()) {
      const ext = extname(entry).toLowerCase();
      if (!ext) continue; // Skip extensionless files

      const relPath = relative(rootPath, fullPath);
      const effectiveType = forceType ?? folderType;
      const extCheck = checkExtension(ext, effectiveType);

      let documentType: FileClassification['documentType'];
      let confidence: FileClassification['confidence'];
      let reason: string;

      if (extCheck === 'skip') {
        documentType = 'SKIPPED';
        confidence = 'auto';
        reason = `Unsupported extension: ${ext}`;
      } else if (forceType) {
        documentType = forceType;
        confidence = 'forced';
        reason = `Forced type: ${forceType}`;
      } else if (effectiveType) {
        documentType = effectiveType;
        confidence = 'auto';
        reason = `Folder "${folderName}" → ${effectiveType}`;
      } else {
        documentType = 'UNKNOWN';
        confidence = 'auto';
        reason = 'No classification — folder name not recognized';
      }

      out.push({
        path: relPath,
        filename: entry,
        extension: ext,
        documentType,
        folder: relDir,
        confidence,
        reason,
        absolutePath: fullPath,
        sizeBytes: stat.size,
      });
    }
  }
}
