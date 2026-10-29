/**
 * Faint lines drawn between related skills once they have all appeared,
 * by skill slug. A line is skipped if either skill is missing or unpublished.
 */
export const constellationLinks: readonly [string, string][] = [
  ["react", "nextjs"],
  ["nextjs", "typescript"],
  ["typescript", "javascript"],
  ["nodejs", "express"],
  ["nodejs", "docker"],
  ["git", "github"],
  ["css", "tailwind"],
];
