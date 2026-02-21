export type SkillType = 'api' | 'conversion' | 'transaction-recipes' | 'jobs' | 'all';

export interface Release {
  tag_name: string;
  name: string;
  published_at: string;
  html_url: string;
  assets: Asset[];
}

export interface Asset {
  name: string;
  browser_download_url: string;
  size: number;
}

export type Platform = 'claude' | 'codex' | 'agents' | 'auto';

export interface InitOptions {
  skill?: SkillType;
  force?: boolean;
  platform?: Platform;
}

export interface UpdateOptions {
  skill?: SkillType;
}

export const SKILL_TYPES: SkillType[] = ['api', 'conversion', 'transaction-recipes', 'jobs', 'all'];

export const SKILL_DESCRIPTIONS: Record<Exclude<SkillType, 'all'>, string> = {
  api: 'Jaz/Juan REST API reference — 55 rules, endpoint catalog, error catalog, field mapping',
  conversion: 'Data conversion pipeline — Xero, QuickBooks, Sage, Excel migration to Jaz',
  'transaction-recipes': 'Complex accounting recipes — prepaid, deferred revenue, loans, IFRS 16, depreciation',
  jobs: 'Accounting job blueprints — month/quarter/year-end close + 7 ad-hoc operational workflows',
};
