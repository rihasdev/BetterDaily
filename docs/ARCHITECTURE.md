# Architecture

React + TypeScript + Vite; Tailwind v4 integration; Lucide icons. Local-first IndexedDB via Dexie. Zod validates stored settings. Workbox via vite-plugin-pwa precaches static build assets. No network API or telemetry.

- src/app: layout, onboarding, navigation
- src/components: shared UI
- src/features: feature screens, grouped by responsibility
- src/domain: date and business rules, testable pure functions
- src/db: versioned database and typed repository
- src/styles: design tokens
- public: original icons
- tests/e2e: browser flows

Version 1 stores settings only. Future stores: goals, habits/revisions, dailyPlans, habitLogs, journalEntries, activityLogs, faithLogs, priorities. Use UUIDs and local-date keys; audit UTC timestamps separately. Historical schedules need snapshots. Future transactions must prevent duplicate XP. Do not log personal content. Handle storage failures visibly.

PWA uses prompted updates to avoid unsolicited reload; offline shell depends on successful caching. Do not claim background notification scheduling. Backup/restore and security review are release gates. Vercel serves HTTPS; deploy previews before production.

## M2a schema version 2

Add `goals` (stable seeded category IDs), `affirmations` (general/faith mode key), `affirmationLogs` (localDate key). Version 1 settings remain intact. Save each category explicitly; hidden categories retain content. Affirmation custom text is separate by mode, acknowledgement is unique per local date and independent of mode/text; undo deletes that date's completion. XP and custom habit links are not implemented. Subsequent schema revisions will add custom goal UUIDs, links, daily priorities and habit stores.

## M2b schema version 3
Four additive stores: habitRevisions, dailyPlans, habitLogs, priorities. Built-in example definitions reconstruct earlier unlogged days; custom schedules use local effective dates. A day freezes its scheduled definitions on first open. Revisions default to tomorrow; explicit today edits update only that habit and cannot remove today's logged habit until entries are cleared (or schedule the change tomorrow). Quantity logs have unique entry IDs; binary/skip state is unique per habit/date. A derived completion recalculates from saved amounts. Priorities use three date/slot keys and link to the existing vision category IDs. Historical quantity/priority edits use the selected local date. The read UI subscribes to IndexedDB changes via Dexie liveQuery. Weekly analytics, full affirmation scheduling, activity overlap and XP remain subsequent work. No data deletion on migration.
