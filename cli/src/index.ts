#!/usr/bin/env node

import { Command } from 'commander';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { initCommand } from './commands/init.js';
import { versionsCommand } from './commands/versions.js';
import { updateCommand } from './commands/update.js';
import { registerCalcCommand } from './commands/calc.js';
import { registerJobsCommand } from './commands/jobs.js';
import type { SkillType } from './types/index.js';
import { SKILL_TYPES } from './types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pkg = JSON.parse(
  readFileSync(join(__dirname, '../package.json'), 'utf-8')
);

const program = new Command();

program
  .name('clio')
  .description('Clio — Command Line Interface Orchestrator for Jaz AI')
  .version(pkg.version)
  .enablePositionalOptions();

program
  .command('init')
  .description('Install Jaz AI skills into the current project')
  .option(
    '-s, --skill <type>',
    `Skill to install (${SKILL_TYPES.join(', ')})`
  )
  .option('-f, --force', 'Overwrite existing files')
  .option(
    '-p, --platform <type>',
    'Target platform: claude, codex, agents, auto (default: auto-detect)'
  )
  .action(async (options) => {
    if (options.skill && !SKILL_TYPES.includes(options.skill)) {
      console.error(`Invalid skill type: ${options.skill}`);
      console.error(`Valid types: ${SKILL_TYPES.join(', ')}`);
      process.exit(1);
    }
    const validPlatforms = ['claude', 'codex', 'agents', 'auto'];
    if (options.platform && !validPlatforms.includes(options.platform)) {
      console.error(`Invalid platform: ${options.platform}`);
      console.error(`Valid platforms: ${validPlatforms.join(', ')}`);
      process.exit(1);
    }
    await initCommand({
      skill: options.skill as SkillType | undefined,
      force: options.force,
      platform: options.platform,
    });
  });

program
  .command('versions')
  .description('List available versions')
  .action(versionsCommand);

program
  .command('update')
  .description('Update Jaz AI skills to latest version')
  .option(
    '-s, --skill <type>',
    `Skill to update (${SKILL_TYPES.join(', ')})`
  )
  .action(async (options) => {
    if (options.skill && !SKILL_TYPES.includes(options.skill)) {
      console.error(`Invalid skill type: ${options.skill}`);
      console.error(`Valid types: ${SKILL_TYPES.join(', ')}`);
      process.exit(1);
    }
    await updateCommand({
      skill: options.skill as SkillType | undefined,
    });
  });

registerCalcCommand(program);
registerJobsCommand(program);
program.parse();
