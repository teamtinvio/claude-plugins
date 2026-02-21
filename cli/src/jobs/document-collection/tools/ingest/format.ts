/**
 * Pretty-print and JSON formatters for document-collection ingest output.
 */

import chalk from 'chalk';
import type { IngestPlan } from '../../../types.js';

/** Print an ingestion plan in human-readable format. */
export function printIngestPlan(plan: IngestPlan): void {
  console.log();
  console.log(chalk.bold('Document Collection — Ingestion Plan'));
  console.log(chalk.gray(`Source: ${plan.source}`));
  if (plan.sourceType === 'url' && plan.cloudProvider) {
    const providerName: Record<string, string> = { dropbox: 'Dropbox', gdrive: 'Google Drive', onedrive: 'OneDrive' };
    console.log(chalk.gray(`Provider: ${providerName[plan.cloudProvider] ?? plan.cloudProvider}`));
    console.log(chalk.gray(`Local path: ${plan.localPath}`));
  }
  console.log();

  for (const folder of plan.folders) {
    const typeLabel = folder.documentType === 'UNKNOWN'
      ? chalk.yellow('UNKNOWN — requires classification')
      : chalk.green(folder.documentType);

    const prefix = folder.documentType === 'UNKNOWN' ? chalk.yellow('[!] ') : '  ';
    console.log(`${prefix}${chalk.bold(folder.folder)}/  (${folder.count} files → ${typeLabel})`);

    // Show filenames (max 8, then "... and N more")
    const names = folder.files.map(f => f.filename);
    const show = names.slice(0, 8);
    console.log(chalk.gray(`    ${show.join(', ')}${names.length > 8 ? `, ... and ${names.length - 8} more` : ''}`));
    console.log();
  }

  // Summary
  console.log(chalk.bold('Summary'));
  console.log(`  Total files: ${plan.summary.total}`);
  console.log(`  Uploadable:  ${chalk.green(String(plan.summary.uploadable))}`);
  if (plan.summary.needClassification > 0) {
    console.log(`  Need classification: ${chalk.yellow(String(plan.summary.needClassification))}`);
  }
  if (plan.summary.skipped > 0) {
    console.log(`  Skipped:     ${chalk.gray(String(plan.summary.skipped))}`);
  }

  // Breakdown by type
  if (Object.keys(plan.summary.byType).length > 0) {
    console.log();
    for (const [type, count] of Object.entries(plan.summary.byType)) {
      console.log(`  ${type}: ${count}`);
    }
  }

  console.log();
}

/** Print ingestion plan as JSON. */
export function printIngestPlanJson(plan: IngestPlan): void {
  console.log(JSON.stringify(plan, null, 2));
}
