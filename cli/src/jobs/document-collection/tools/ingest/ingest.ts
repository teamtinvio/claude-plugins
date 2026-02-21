/**
 * Document Collection ingest tool.
 *
 * Scans a local directory or cloud share link, classifies documents by folder name,
 * and produces an IngestPlan with absolute file paths for the AI agent to upload.
 *
 * The CLI does NOT make API calls — the agent uses the api skill for that.
 */

import { existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import type { IngestPlan } from '../../../types.js';
import { JobValidationError } from '../../../validate.js';
import { scanLocalDirectory } from './scanner.js';
import { downloadCloudSource } from './cloud/index.js';
import type { CloudDownloadResult } from './cloud/types.js';

export interface IngestOptions {
  /** Source path (local directory) or URL (public share link). */
  source: string;
  /** Force all files to a specific document type. */
  type?: 'INVOICE' | 'BILL' | 'BANK_STATEMENT';
  /** Functional/reporting currency. */
  currency?: string;
  /** Download timeout in milliseconds for cloud sources. */
  timeout?: number;
}

/**
 * Detect if a source string is a URL (public share link) or local path.
 */
export function isUrl(source: string): boolean {
  return /^https?:\/\//i.test(source);
}

/**
 * Validate that the source is a local directory. Returns the resolved path.
 */
function validateLocalSource(source: string): string {
  if (!existsSync(source)) {
    throw new JobValidationError(`Source directory not found: ${source}`);
  }

  let stat;
  try {
    stat = statSync(source);
  } catch {
    throw new JobValidationError(`Cannot access source: ${source}`);
  }

  if (!stat.isDirectory()) {
    throw new JobValidationError(`Source must be a directory, not a file: ${source}`);
  }

  return resolve(source);
}

/**
 * Resolve a source (local path or URL) to a local directory path.
 * For URLs, downloads to a temp dir. The temp dir is NOT cleaned up —
 * the agent needs the files to upload via the API.
 */
async function resolveSource(
  opts: IngestOptions,
): Promise<{ localPath: string; originalSource: string; cloud: CloudDownloadResult | null }> {
  if (isUrl(opts.source)) {
    const cloud = await downloadCloudSource(opts.source, {
      timeout: opts.timeout,
    });
    return { localPath: cloud.localPath, originalSource: opts.source, cloud };
  }

  return { localPath: validateLocalSource(opts.source), originalSource: opts.source, cloud: null };
}

/**
 * Scan, classify, and return an IngestPlan with absolute file paths.
 *
 * For cloud sources, files are downloaded to a temp directory first.
 * The temp dir is preserved so the agent can use the file paths for uploads.
 */
export async function ingest(opts: IngestOptions): Promise<IngestPlan> {
  const { localPath, originalSource, cloud } = await resolveSource(opts);

  const plan = scanLocalDirectory(localPath, { forceType: opts.type });

  // Override source display and localPath for URL sources
  if (cloud) {
    plan.source = originalSource;
    plan.sourceType = 'url';
    plan.cloudProvider = cloud.provider;
    plan.localPath = localPath;
  }

  return plan;
}
