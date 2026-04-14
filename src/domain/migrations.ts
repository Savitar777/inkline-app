/* ─── Schema Migration Chain ─── */

export const CURRENT_SCHEMA_VERSION = 3

type MigrationFn = (raw: unknown) => unknown

/**
 * Ordered migration functions: index N migrates version N → N+1.
 * Each function receives the raw parsed JSON and returns the migrated shape.
 */
const MIGRATIONS: MigrationFn[] = [
  // Migration 0 → 1: normalize pre-versioning documents (identity for now)
  (raw) => raw,
  // Migration 1 → 2: add storyBible and extended character fields
  (raw) => {
    const doc = raw as Record<string, unknown>
    if (!doc.storyBible) {
      doc.storyBible = { arcs: [], locations: [], worldRules: [], timeline: [] }
    }
    return doc
  },
  // Migration 2 → 3: deadline/assignedRole on episodes/pages (no-op — fields are optional)
  (raw) => raw,
]

/**
 * Run the migration chain from `fromVersion` up to CURRENT_SCHEMA_VERSION.
 * If any migration throws, the error propagates to the caller.
 */
export function migrateProjectDocument(raw: unknown, fromVersion: number): unknown {
  let current = raw
  for (let v = fromVersion; v < CURRENT_SCHEMA_VERSION; v++) {
    if (v < MIGRATIONS.length) {
      current = MIGRATIONS[v](current)
    }
  }
  return current
}
