import { mkdir, cp, rm, access, readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { SkillType, Platform } from '../types/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
// From dist/utils/template.js -> ../../assets (two levels up to cli/, then assets/)
const ASSETS_DIR = join(__dirname, '..', '..', 'assets');

const SKILLS: Exclude<SkillType, 'all'>[] = ['api', 'conversion', 'transaction-recipes', 'jobs'];

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * Detect the AI platform based on project directory contents.
 *
 * Priority: explicit markers first, then fall back to universal standard.
 */
export async function detectPlatform(projectDir: string): Promise<'claude' | 'agents'> {
  // Check for existing skill installations
  if (await exists(join(projectDir, '.claude', 'skills'))) return 'claude';
  if (await exists(join(projectDir, '.agents', 'skills'))) return 'agents';

  // Check for platform-specific config dirs
  if (await exists(join(projectDir, '.claude'))) return 'claude';
  if (await exists(join(projectDir, '.codex'))) return 'agents';

  // Check for platform-specific instruction files
  if (await exists(join(projectDir, 'CLAUDE.md'))) return 'claude';
  if (await exists(join(projectDir, 'AGENTS.md'))) return 'agents';

  // Default: Agent Skills open standard (universal)
  return 'agents';
}

/**
 * Resolve the skill base directory for a given platform.
 */
function skillBasePath(platform: 'claude' | 'agents'): string {
  return platform === 'claude' ? '.claude/skills' : '.agents/skills';
}

/**
 * Install skill files into a target project directory.
 * Creates <basePath>/<skillName>/ with SKILL.md + references/
 */
async function installSkill(
  targetDir: string,
  skillName: string,
  force: boolean,
  platform: 'claude' | 'agents'
): Promise<string> {
  const sourceDir = join(ASSETS_DIR, 'skills', skillName);
  const base = skillBasePath(platform);
  const targetSkillDir = join(targetDir, base, skillName);

  if (!(await exists(sourceDir))) {
    throw new Error(`Skill source not found: ${sourceDir}`);
  }

  if (await exists(targetSkillDir)) {
    if (!force) {
      throw new Error(
        `${targetSkillDir} already exists. Use --force to overwrite.`
      );
    }
    // Remove stale files before copying (ensures deleted references don't linger)
    await rm(targetSkillDir, { recursive: true, force: true });
  }

  await mkdir(targetSkillDir, { recursive: true });
  await cp(sourceDir, targetSkillDir, { recursive: true, force: true });

  return `${base}/${skillName}`;
}

/**
 * Install selected skills into the target project.
 */
export async function installSkills(
  targetDir: string,
  skillType: SkillType,
  force = false,
  platform: Platform = 'auto'
): Promise<string[]> {
  // Resolve platform
  const resolvedPlatform = platform === 'auto' || platform === 'codex'
    ? (platform === 'codex' ? 'agents' as const : await detectPlatform(targetDir))
    : platform;

  const skillsToInstall =
    skillType === 'all' ? SKILLS : [skillType as Exclude<SkillType, 'all'>];
  const installedPaths: string[] = [];

  for (const skill of skillsToInstall) {
    const path = await installSkill(targetDir, skill, force, resolvedPlatform);
    installedPaths.push(path);
  }

  return installedPaths;
}
