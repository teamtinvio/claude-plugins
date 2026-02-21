import chalk from 'chalk';
import { readFileSync } from 'node:fs';
import { Command } from 'commander';
import { generateMonthEndBlueprint } from '../jobs/month-end/blueprint.js';
import { generateQuarterEndBlueprint } from '../jobs/quarter-end/blueprint.js';
import { generateYearEndBlueprint } from '../jobs/year-end/blueprint.js';
import { generateBankReconBlueprint } from '../jobs/bank-recon/blueprint.js';
import { generateGstVatBlueprint } from '../jobs/gst-vat/blueprint.js';
import { generatePaymentRunBlueprint } from '../jobs/payment-run/blueprint.js';
import { generateCreditControlBlueprint } from '../jobs/credit-control/blueprint.js';
import { generateSupplierReconBlueprint } from '../jobs/supplier-recon/blueprint.js';
import { generateAuditPrepBlueprint } from '../jobs/audit-prep/blueprint.js';
import { generateFaReviewBlueprint } from '../jobs/fa-review/blueprint.js';
import { generateDocumentCollectionBlueprint } from '../jobs/document-collection/blueprint.js';
import { generateStatutoryFilingBlueprint } from '../jobs/statutory-filing/blueprint.js';
import { ingest } from '../jobs/document-collection/tools/ingest/ingest.js';
import { printIngestPlan, printIngestPlanJson } from '../jobs/document-collection/tools/ingest/format.js';
import { matchBankRecords } from '../jobs/bank-recon/tools/match/match.js';
import { computeFormCs } from '../jobs/statutory-filing/tools/sg-tax/form-cs.js';
import { computeCapitalAllowances } from '../jobs/statutory-filing/tools/sg-tax/capital-allowances.js';
import { printTaxResult, printTaxJson } from '../jobs/statutory-filing/tools/sg-tax/format.js';
import { TaxValidationError } from '../jobs/statutory-filing/tools/sg-tax/validate.js';
import type { SgFormCsInput, SgCapitalAllowanceInput, AssetCategory } from '../jobs/statutory-filing/tools/sg-tax/types.js';
import { printBlueprint, printBlueprintJson } from '../jobs/format.js';
import { printResult, printJson } from '../calc/format.js';
import { JobValidationError } from '../jobs/validate.js';
import { validateBankMatchInput, CalcValidationError } from '../calc/validate.js';

/** Wrap job/tool action with validation error handling. */
function jobAction(fn: (opts: Record<string, unknown>) => void) {
  return (opts: Record<string, unknown>) => {
    try {
      fn(opts);
    } catch (err) {
      if (err instanceof JobValidationError || err instanceof CalcValidationError || err instanceof TaxValidationError) {
        console.error(chalk.red(`Error: ${err.message}`));
        process.exit(1);
      }
      throw err;
    }
  };
}

export function registerJobsCommand(program: Command): void {
  const jobs = program
    .command('jobs')
    .enablePositionalOptions()
    .description('Accounting job blueprints — month-end, quarter-end, year-end, bank-recon, gst-vat, payment-run, credit-control, supplier-recon, audit-prep, fa-review, document-collection, statutory-filing');

  // ── clio jobs month-end ──────────────────────────────────────────
  jobs
    .command('month-end')
    .description('Month-end close blueprint (5 phases, 18 steps)')
    .requiredOption('--period <YYYY-MM>', 'Month period (e.g., 2025-01)')
    .option('--currency <code>', 'Currency code (e.g. SGD, USD)')
    .option('--json', 'Output as JSON')
    .action(jobAction((opts) => {
      const bp = generateMonthEndBlueprint({
        period: opts.period as string,
        currency: opts.currency as string | undefined,
      });
      opts.json ? printBlueprintJson(bp) : printBlueprint(bp);
    }));

  // ── clio jobs quarter-end ────────────────────────────────────────
  jobs
    .command('quarter-end')
    .description('Quarter-end close blueprint (monthly × 3 + quarterly extras)')
    .requiredOption('--period <YYYY-QN>', 'Quarter period (e.g., 2025-Q1)')
    .option('--incremental', 'Generate only quarterly extras (assumes months already closed)')
    .option('--currency <code>', 'Currency code (e.g. SGD, USD)')
    .option('--json', 'Output as JSON')
    .action(jobAction((opts) => {
      const bp = generateQuarterEndBlueprint({
        period: opts.period as string,
        currency: opts.currency as string | undefined,
        incremental: opts.incremental as boolean | undefined,
      });
      opts.json ? printBlueprintJson(bp) : printBlueprint(bp);
    }));

  // ── clio jobs year-end ───────────────────────────────────────────
  jobs
    .command('year-end')
    .description('Year-end close blueprint (quarterly × 4 + annual extras)')
    .requiredOption('--period <YYYY>', 'Fiscal year (e.g., 2025)')
    .option('--incremental', 'Generate only annual extras (assumes quarters already closed)')
    .option('--currency <code>', 'Currency code (e.g. SGD, USD)')
    .option('--json', 'Output as JSON')
    .action(jobAction((opts) => {
      const bp = generateYearEndBlueprint({
        period: opts.period as string,
        currency: opts.currency as string | undefined,
        incremental: opts.incremental as boolean | undefined,
      });
      opts.json ? printBlueprintJson(bp) : printBlueprint(bp);
    }));

  // ── clio jobs bank-recon (command group: blueprint + match tool) ──
  const bankRecon = jobs
    .command('bank-recon')
    .description('Bank reconciliation — blueprint + match tool')
    .enablePositionalOptions()
    .passThroughOptions()
    .option('--account <name>', 'Specific bank account name')
    .option('--period <YYYY-MM>', 'Month period to reconcile')
    .option('--currency <code>', 'Currency code (e.g. SGD, USD)')
    .option('--json', 'Output as JSON')
    .action(jobAction((opts) => {
      const bp = generateBankReconBlueprint({
        account: opts.account as string | undefined,
        period: opts.period as string | undefined,
        currency: opts.currency as string | undefined,
      });
      opts.json ? printBlueprintJson(bp) : printBlueprint(bp);
    }));

  // ── clio jobs bank-recon match ────────────────────────────────────
  bankRecon
    .command('match')
    .description('Bank reconciliation matcher — finds 1:1, N:1, 1:N, and N:M matches between bank records and transactions')
    .option('--input <file>', 'JSON file with bankRecords + transactions (or pipe via stdin)')
    .option('--tolerance <amount>', 'Amount tolerance in functional currency (default: 0.01)', parseFloat)
    .option('--date-window <days>', 'Max days apart for matching (default: 14)', parseInt)
    .option('--max-group <k>', 'Max subset size for N:1/1:N matching (default: 5, max: 10)', parseInt)
    .option('--currency <code>', 'Functional/reporting currency (e.g. SGD)')
    .option('--find-all', 'Return all possible matches per record (analysis mode)')
    .option('--json', 'Output as JSON')
    .action(jobAction((opts) => {
      let rawJson: string;

      if (opts.input) {
        try {
          rawJson = readFileSync(opts.input as string, 'utf-8');
        } catch {
          throw new CalcValidationError(`Cannot read file: ${opts.input}`);
        }
      } else if (!process.stdin.isTTY) {
        rawJson = readFileSync(0, 'utf-8');
      } else {
        throw new CalcValidationError(
          'No input provided. Use --input <file> or pipe JSON via stdin:\n' +
          '  clio jobs bank-recon match --input match-data.json\n' +
          '  cat data.json | clio jobs bank-recon match --json'
        );
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(rawJson);
      } catch {
        throw new CalcValidationError('Invalid JSON input — check file format');
      }

      const input = validateBankMatchInput(parsed);

      if (!input.options) input.options = {};
      if (opts.tolerance !== undefined) input.options.tolerance = opts.tolerance as number;
      if (opts.dateWindow !== undefined) input.options.dateWindowDays = opts.dateWindow as number;
      if (opts.maxGroup !== undefined) input.options.maxGroupSize = opts.maxGroup as number;
      if (opts.currency) input.options.currency = opts.currency as string;
      if (opts.findAll) input.options.findAll = true;

      const result = matchBankRecords(input);
      opts.json ? printJson(result) : printResult(result);
    }));

  // ── clio jobs gst-vat ────────────────────────────────────────────
  jobs
    .command('gst-vat')
    .description('GST/VAT filing preparation blueprint')
    .requiredOption('--period <YYYY-QN>', 'Quarter period (e.g., 2025-Q1)')
    .option('--currency <code>', 'Currency code (e.g. SGD, USD)')
    .option('--json', 'Output as JSON')
    .action(jobAction((opts) => {
      const bp = generateGstVatBlueprint({
        period: opts.period as string,
        currency: opts.currency as string | undefined,
      });
      opts.json ? printBlueprintJson(bp) : printBlueprint(bp);
    }));

  // ── clio jobs payment-run ────────────────────────────────────────
  jobs
    .command('payment-run')
    .description('Payment run blueprint (bulk bill payments)')
    .option('--due-before <YYYY-MM-DD>', 'Pay bills due on or before this date')
    .option('--currency <code>', 'Currency code (e.g. SGD, USD)')
    .option('--json', 'Output as JSON')
    .action(jobAction((opts) => {
      const bp = generatePaymentRunBlueprint({
        dueBefore: opts.dueBefore as string | undefined,
        currency: opts.currency as string | undefined,
      });
      opts.json ? printBlueprintJson(bp) : printBlueprint(bp);
    }));

  // ── clio jobs credit-control ─────────────────────────────────────
  jobs
    .command('credit-control')
    .description('Credit control / AR chase blueprint')
    .option('--overdue-days <days>', 'Minimum overdue days to include', (v: string) => {
      const n = Number.parseInt(v, 10);
      if (!Number.isFinite(n)) throw new JobValidationError(`overdue-days must be an integer (got "${v}")`);
      return n;
    })
    .option('--currency <code>', 'Currency code (e.g. SGD, USD)')
    .option('--json', 'Output as JSON')
    .action(jobAction((opts) => {
      const bp = generateCreditControlBlueprint({
        overdueDays: opts.overdueDays as number | undefined,
        currency: opts.currency as string | undefined,
      });
      opts.json ? printBlueprintJson(bp) : printBlueprint(bp);
    }));

  // ── clio jobs supplier-recon ─────────────────────────────────────
  jobs
    .command('supplier-recon')
    .description('Supplier statement reconciliation blueprint')
    .option('--supplier <name>', 'Specific supplier name')
    .option('--period <YYYY-MM>', 'Month period')
    .option('--currency <code>', 'Currency code (e.g. SGD, USD)')
    .option('--json', 'Output as JSON')
    .action(jobAction((opts) => {
      const bp = generateSupplierReconBlueprint({
        supplier: opts.supplier as string | undefined,
        period: opts.period as string | undefined,
        currency: opts.currency as string | undefined,
      });
      opts.json ? printBlueprintJson(bp) : printBlueprint(bp);
    }));

  // ── clio jobs audit-prep ─────────────────────────────────────────
  jobs
    .command('audit-prep')
    .description('Audit preparation pack blueprint')
    .requiredOption('--period <YYYY|YYYY-QN>', 'Fiscal year or quarter (e.g., 2025 or 2025-Q3)')
    .option('--currency <code>', 'Currency code (e.g. SGD, USD)')
    .option('--json', 'Output as JSON')
    .action(jobAction((opts) => {
      const bp = generateAuditPrepBlueprint({
        period: opts.period as string,
        currency: opts.currency as string | undefined,
      });
      opts.json ? printBlueprintJson(bp) : printBlueprint(bp);
    }));

  // ── clio jobs fa-review ──────────────────────────────────────────
  jobs
    .command('fa-review')
    .description('Fixed asset register review blueprint')
    .option('--currency <code>', 'Currency code (e.g. SGD, USD)')
    .option('--json', 'Output as JSON')
    .action(jobAction((opts) => {
      const bp = generateFaReviewBlueprint({
        currency: opts.currency as string | undefined,
      });
      opts.json ? printBlueprintJson(bp) : printBlueprint(bp);
    }));

  // ── clio jobs document-collection (command group: blueprint + ingest tool) ──
  const docCollection = jobs
    .command('document-collection')
    .description('Document collection — scan, classify, and upload client documents')
    .enablePositionalOptions()
    .passThroughOptions()
    .option('--currency <code>', 'Currency code (e.g. SGD, USD)')
    .option('--json', 'Output as JSON')
    .action(jobAction((opts) => {
      const bp = generateDocumentCollectionBlueprint({
        currency: opts.currency as string | undefined,
      });
      opts.json ? printBlueprintJson(bp) : printBlueprint(bp);
    }));

  // ── clio jobs document-collection ingest ────────────────────────
  docCollection
    .command('ingest')
    .description('Scan and classify client documents — outputs file paths for agent upload')
    .requiredOption('--source <path>', 'Local directory path or public share URL (Dropbox, Google Drive, OneDrive)')
    .option('--type <type>', 'Force document type: invoice, bill, or bank-statement')
    .option('--timeout <ms>', 'Download timeout in milliseconds for cloud sources (default: 30000)', parseInt)
    .option('--currency <code>', 'Functional/reporting currency (e.g. SGD)')
    .option('--json', 'Output as JSON')
    .action(jobAction((opts) => {
      // Normalize --type flag
      const typeMap: Record<string, 'INVOICE' | 'BILL' | 'BANK_STATEMENT'> = {
        invoice: 'INVOICE',
        bill: 'BILL',
        'bank-statement': 'BANK_STATEMENT',
        bank_statement: 'BANK_STATEMENT',
      };
      const forceType = opts.type ? typeMap[(opts.type as string).toLowerCase()] : undefined;
      if (opts.type && !forceType) {
        throw new JobValidationError(
          `Invalid --type "${opts.type}". Use: invoice, bill, or bank-statement`
        );
      }

      ingest({
        source: opts.source as string,
        type: forceType,
        currency: opts.currency as string | undefined,
        timeout: opts.timeout as number | undefined,
      }).then((plan) => {
        opts.json ? printIngestPlanJson(plan) : printIngestPlan(plan);
      }).catch((err) => {
        console.error(chalk.red(`Error: ${err instanceof Error ? err.message : String(err)}`));
        process.exit(1);
      });
    }));

  // ── clio jobs statutory-filing (command group: blueprint + sg-cs + sg-ca) ──
  const statFiling = jobs
    .command('statutory-filing')
    .description('Statutory filing — corporate income tax computation and filing')
    .enablePositionalOptions()
    .passThroughOptions()
    .option('--ya <year>', 'Year of Assessment', parseInt)
    .option('--jurisdiction <code>', 'Jurisdiction: sg (default)', 'sg')
    .option('--currency <code>', 'Currency code (e.g. SGD)')
    .option('--json', 'Output as JSON')
    .action(jobAction((opts) => {
      const bp = generateStatutoryFilingBlueprint({
        ya: opts.ya as number | undefined,
        jurisdiction: opts.jurisdiction as string | undefined,
        currency: opts.currency as string | undefined,
      });
      opts.json ? printBlueprintJson(bp) : printBlueprint(bp);
    }));

  // ── clio jobs statutory-filing sg-cs ───────────────────────────────
  statFiling
    .command('sg-cs')
    .description('Singapore Form C-S / C-S Lite corporate income tax computation')
    .option('--input <file>', 'JSON input file (full SgFormCsInput structure)')
    .option('--ya <year>', 'Year of Assessment', parseInt)
    .option('--revenue <amount>', 'Total revenue', parseFloat)
    .option('--profit <amount>', 'Accounting net profit/loss', parseFloat)
    .option('--depreciation <amount>', 'Accounting depreciation (add-back)', parseFloat)
    .option('--amortization <amount>', 'Intangible amortization (add-back)', parseFloat)
    .option('--rou-depreciation <amount>', 'IFRS 16 ROU depreciation (add-back)', parseFloat)
    .option('--lease-interest <amount>', 'IFRS 16 lease interest (add-back)', parseFloat)
    .option('--lease-payments <amount>', 'Actual lease payments (deduction)', parseFloat)
    .option('--provisions <amount>', 'General provisions (add-back)', parseFloat)
    .option('--donations <amount>', 'IPC donations (add-back, claimed at 250%)', parseFloat)
    .option('--entertainment <amount>', 'Non-deductible entertainment', parseFloat)
    .option('--penalties <amount>', 'Penalties & fines', parseFloat)
    .option('--private-car <amount>', 'S-plated vehicle expenses', parseFloat)
    .option('--ca <amount>', 'Current year capital allowances', parseFloat)
    .option('--ca-bf <amount>', 'Unabsorbed CA brought forward', parseFloat)
    .option('--losses-bf <amount>', 'Unabsorbed trade losses b/f', parseFloat)
    .option('--donations-bf <amount>', 'Unabsorbed donations b/f', parseFloat)
    .option('--exemption <type>', 'Exemption type: sute, pte (default), none', 'pte')
    .option('--basis-start <date>', 'Basis period start (YYYY-MM-DD)')
    .option('--basis-end <date>', 'Basis period end (YYYY-MM-DD)')
    .option('--currency <code>', 'Currency code (default: SGD)')
    .option('--json', 'Output as JSON')
    .action(jobAction((opts) => {
      const jsonInput = readTaxJsonInput(opts);
      let input: SgFormCsInput;

      if (jsonInput) {
        input = jsonInput as SgFormCsInput;
      } else {
        if (!opts.ya) {
          throw new TaxValidationError('--ya (Year of Assessment) is required');
        }
        input = buildDefaultSgCsInput(opts);
      }

      const result = computeFormCs(input);
      opts.json ? printTaxJson(result) : printTaxResult(result);
    }));

  // ── clio jobs statutory-filing sg-ca ───────────────────────────────
  statFiling
    .command('sg-ca')
    .description('Singapore capital allowance schedule (per-asset computation)')
    .option('--input <file>', 'JSON input file (full SgCapitalAllowanceInput structure)')
    .option('--ya <year>', 'Year of Assessment', parseInt)
    .option('--cost <amount>', 'Asset cost (simple single-asset mode)', parseFloat)
    .option('--category <cat>', 'Asset category: computer, automation, low-value, general, ip, renovation')
    .option('--acquired <date>', 'Acquisition date (YYYY-MM-DD)')
    .option('--prior-claimed <amount>', 'CA already claimed in prior YAs', parseFloat, 0)
    .option('--ip-years <years>', 'IP write-off period (5, 10, or 15)', parseInt)
    .option('--unabsorbed-bf <amount>', 'Unabsorbed CA brought forward', parseFloat, 0)
    .option('--currency <code>', 'Currency code (default: SGD)')
    .option('--json', 'Output as JSON')
    .action(jobAction((opts) => {
      const jsonInput = readTaxJsonInput(opts);
      let input: SgCapitalAllowanceInput;

      if (jsonInput) {
        input = jsonInput as SgCapitalAllowanceInput;
      } else {
        if (!opts.ya) {
          throw new TaxValidationError('--ya (Year of Assessment) is required');
        }
        if (!opts.cost || !opts.category || !opts.acquired) {
          throw new TaxValidationError('--cost, --category, and --acquired are required in simple mode');
        }
        input = {
          ya: opts.ya as number,
          currency: opts.currency as string | undefined,
          unabsorbedBroughtForward: opts.unabsorbedBf as number,
          assets: [{
            description: `${(opts.category as string).charAt(0).toUpperCase() + (opts.category as string).slice(1)} asset`,
            cost: opts.cost as number,
            acquisitionDate: opts.acquired as string,
            category: opts.category as AssetCategory,
            priorYearsClaimed: opts.priorClaimed as number,
            ipWriteOffYears: opts.ipYears as number | undefined,
          }],
        };
      }

      const result = computeCapitalAllowances(input);
      opts.json ? printTaxJson(result) : printTaxResult(result);
    }));
}

// ── Tax input helpers ──────────────────────────────────────────────

/** Read JSON input from --input file or stdin. */
function readTaxJsonInput(opts: Record<string, unknown>): unknown {
  const inputFile = opts.input as string | undefined;
  if (inputFile) {
    const raw = readFileSync(inputFile, 'utf-8');
    return JSON.parse(raw);
  }
  if (!process.stdin.isTTY) {
    try {
      const raw = readFileSync(0, 'utf-8').trim();
      if (raw) return JSON.parse(raw);
    } catch {
      // No stdin data available
    }
  }
  return null;
}

/** Build a default SgFormCsInput structure from CLI flags. */
function buildDefaultSgCsInput(opts: Record<string, unknown>): SgFormCsInput {
  return {
    ya: opts.ya as number,
    basisPeriodStart: (opts.basisStart as string) ?? `${(opts.ya as number) - 1}-01-01`,
    basisPeriodEnd: (opts.basisEnd as string) ?? `${(opts.ya as number) - 1}-12-31`,
    currency: opts.currency as string | undefined,
    revenue: (opts.revenue as number) ?? 0,
    accountingProfit: (opts.profit as number) ?? 0,
    addBacks: {
      depreciation: (opts.depreciation as number) ?? 0,
      amortization: (opts.amortization as number) ?? 0,
      rouDepreciation: (opts.rouDepreciation as number) ?? 0,
      leaseInterest: (opts.leaseInterest as number) ?? 0,
      generalProvisions: (opts.provisions as number) ?? 0,
      donations: (opts.donations as number) ?? 0,
      entertainment: (opts.entertainment as number) ?? 0,
      penalties: (opts.penalties as number) ?? 0,
      privateCar: (opts.privateCar as number) ?? 0,
      capitalExpOnPnl: 0,
      unrealizedFxLoss: 0,
      otherNonDeductible: 0,
    },
    deductions: {
      actualLeasePayments: (opts.leasePayments as number) ?? 0,
      unrealizedFxGain: 0,
      exemptDividends: 0,
      exemptIncome: 0,
      otherDeductions: 0,
    },
    capitalAllowances: {
      currentYearClaim: (opts.ca as number) ?? 0,
      balanceBroughtForward: (opts.caBf as number) ?? 0,
    },
    enhancedDeductions: {
      rdExpenditure: 0,
      rdMultiplier: 2.5,
      ipRegistration: 0,
      ipMultiplier: 2.0,
      donations250Base: (opts.donations as number) ?? 0,
      s14qRenovation: 0,
    },
    losses: {
      broughtForward: (opts.lossesBf as number) ?? 0,
    },
    donationsCarryForward: {
      broughtForward: (opts.donationsBf as number) ?? 0,
    },
    exemptionType: (opts.exemption as 'sute' | 'pte' | 'none') ?? 'pte',
  };
}
