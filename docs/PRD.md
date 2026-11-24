# BetterDaily

## Product requirements & development plan

**Version:** 1.0 · MVP baseline | **Date:** 24 November 2026 | **Status:** Proposed for implementation

**Product promise:** Small actions. Meaningful changes. Every day.

### 01 / Product definition
BetterDaily is a free, gamified, local-first progressive web app (PWA) for intentional living. It guides users through morning preparation, mindful daytime choices and evening reflection, connecting daily behavior to a personal vision. The app is a general wellness tool, not a diagnostic, medical or mental health treatment product.

| Decision | MVP baseline |
|---|---|
| Platform | Mobile-first PWA; usable in desktop and mobile browsers |
| Audience | Adults seeking healthier habits; optional Islamic mode, off by default |
| Business model | Free; no ads, subscriptions or paywalls |
| Identity | Single local profile; no login or account |
| Data | IndexedDB on device; explicit backup and restore |
| Style | Playful, accessible, encouraging gamification |
| Release scope | All nine practices, lightweight progress and privacy controls |

### Product objectives
- Help a user complete their first meaningful action within two minutes of onboarding.
- Make daily check-ins quick: target under 30 seconds for logging a habit or gratitude moment.
- Encourage sustainable repetition rather than perfection, competition or compulsive engagement.
- Make all core actions available offline after the initial successful online setup.
- Preserve user control over private journals, optional religious content and data removal.

### User groups and jobs to be done
- Busy professionals and students: organize a manageable morning-to-night routine.
- People seeking personal growth: connect life goals to actions and reflect without judgment.
- People who prefer faith-based routines: optionally integrate Salah, Dhikr and gratitude.

### Scope boundaries
**Must ship:** nine practices, onboarding, daily dashboard, optional Islamic mode (basic), local history, points, basic achievements, custom goals/habits, backup/restore, deletion, offline behavior and accessibility.
**Later:** AI coaching, cloud sync, accounts, social features, wearable integrations, push reminders, automatic prayer times, extensive religious content, native apps, subscriptions, leaderboards and photo/audio journaling. No backend is required for MVP.

<!-- PAGE -->
## 02 / Functional requirements: morning and daytime

Priority P0 means required to ship. All nine practices are P0 in a focused form. The requirements below describe intended behavior, not implemented functionality. Each acceptance condition must pass before release.

### BD-01 · Life Vision (One-Page Miracle)
**User story:** As a user, I want to describe the life I want so I can choose actions that support it.
- Editable vision across relationships, career/learning, finances, physical, emotional and spiritual/personal well-being. All categories are optional; rename or hide them.
- Connect up to three daily priorities or any custom habit to a goal; review or revise vision any time. Offer the prompt: “Are my actions helping me move toward this?”
**Acceptance:** Create, edit, reload and view the vision offline; links remain valid; deleting a goal unlinks rather than deletes associated habits or history.

### BD-02 · Morning affirmation
- Show an original default affirmation (e.g., “I will approach today with intention and kindness.”). Allow custom text, a morning check-in and an optional faith-based variant.
**Acceptance:** Acknowledge once per day; editing the text or repeated taps do not add extra points; the user may skip without penalty.

### BD-03 · Sunlight, movement and water
- Three separate configurable actions: outdoor daylight (minutes), gentle movement (minutes), water (mL). Default examples: 10 min daylight, 10 min movement, 250 mL water; users can change or disable each. Values are prompts, not medical targets. Do not encourage direct sun-gazing, excess hydration or exercising through pain.
- Quick-add, edit and delete quantities; update today’s totals; completion occurs at user target. Avoid automatic device sensor claims.
**Acceptance:** Logging 100 + 150 mL reaches a 250 mL target; deleting 100 mL reverses completion; negative quantities rejected; offline entries persist.

### BD-04 · Micro-miracles (gratitude journal)
- Quick capture of positive moments, with timestamp and optional tag. Text-only in MVP; history sorted newest first, with edit/delete. A daily gratitude goal is met with at least one entry.
**Acceptance:** Save a short entry offline, reload, edit and delete it; only the first daily qualifying entry earns points.

### BD-05 · Mindful decision filter
- On-demand prompt: “Is this choice helpful for my brain, body, values and future?” Optional context and response: proceed, choose an alternative, or revisit later. User can record a decision or simply close the prompt.
**Acceptance:** A decision can be logged in under three interactions after opening; recording more decisions cannot farm daily points; private answers remain local.

<!-- PAGE -->
## 03 / Functional requirements: reflection and recovery

### BD-06 · Thought journal
**User story:** When I feel distressed, I want a private space to examine thoughts without being judged.
- Optional guided fields: situation, emotion, thought, evidence for/against, balanced perspective and next action. Save drafts, revise or delete; avoid forced positive conclusions. No automated diagnosis, sentiment scoring or treatment claims.
- Display a discreet help note that the journal is not therapy and urgent distress warrants appropriate local emergency/professional support. No points or streaks tied to distress or frequency of journaling.
**Acceptance:** Save a partial draft or complete entry; edit and remove it offline; blank drafts do not count as completed activities; the UI never labels a person as healthy/unhealthy.

### BD-07 · Sport and coordination
- Choose or add a sport/activity, record minutes and date; examples: table tennis, badminton, walking, skipping, dancing or strength work. Set a weekly goal of active days or minutes; allow rest days. Avoid ranking any sport as universally best.
**Acceptance:** Log two sessions on one day; weekly active days increase by one, minutes by their sum; edits/deletions recalculate. A session linked to morning movement is a single record, not two duplicated activities.

### BD-08 · Digital sunset
- User sets bedtime and wind-down lead time (example: 60 minutes). Checklist: put phone away, dim lights, prepare for tomorrow; editable items. Show in-app schedule and allow user to acknowledge completion. No ability to block other apps or verify screen use.
**Acceptance:** For a 22:30 bedtime and 60-minute lead, display 21:30; also handle midnight crossover. Mark as done, undo, and retain history. Closed-app notifications are not promised.

### BD-09 · Evening reflection
- Prompt “What went well today?” with fields for positive moments, gratitude, lessons, one improvement and tomorrow’s priorities. All fields optional; save an entry with at least one nonblank field. Offer the day's gratitude entries for context without copying them automatically.
**Acceptance:** Save/reopen/edit a reflection associated with its selected date; one completion per date; reflection remains private. User can review a prior date without changing today's status.

### BD-10 · Daily routine and custom habits
- Dashboard groups tasks by Morning, Daytime and Evening; display next recommended task and completion count; allow simple recurring binary habits, schedule (selected weekdays), optional goal link, hide/archive and undo. Offer no-pressure skipped status and editable historical dates.
**Acceptance:** A scheduled task appears on correct weekdays only; archiving hides future tasks while retaining historical logs; editing a past date does not overwrite today's records.

<!-- PAGE -->
## 04 / User experience and Islamic mode

### Navigation and screen inventory
| Screen | Key functions |
|---|---|
| Onboarding | Welcome, choose focus areas, optional faith mode, select habits, local-data notice; skip optional steps |
| Today | Date, progress, next action, morning/day/evening groups, quick-add actions |
| Goals | Life vision, goal editing, linked habits, daily priorities |
| Journal | Gratitude, decisions, thoughts, evening reflection; edit/delete and date filter |
| Progress | Seven-day and 30-day habit history, XP/level, milestones, active days |
| Settings | Theme, schedules, habit editor, optional mode, install help, privacy, export/import/reset |

### Optional Islamic mode · BD-11 (P0)
- Off by default; activate voluntarily in onboarding or Settings. Turning it off hides faith content but preserves entries for later reactivation unless explicitly deleted.
- Five daily Salah checkboxes (Fajr, Dhuhr, Asr, Maghrib, Isha); use user-entered times or prayer names as routine anchors. No location permission or automatic prayer calculations in MVP.
- Basic sourced Dua collection with Arabic, transliteration, translation and citation; include Quran 2:201, 28:24, 17:24, and verify text, references and translations before shipping. Dhikr counter and Quran reading check-in are optional simple tools.
- Shukr and Muhasabah labels for gratitude and reflection; faith-friendly affirmation option. Clearly separate personal routine suggestions from prescribed acts. No XP for prayer, Dhikr, Quran or Dua; no faith grades, religious streak pressure or comparison.
**Acceptance:** General mode contains no unsolicited religious prompts. Mode toggle, Arabic right-to-left display, prayer checkboxes and offline content work; hiding mode never deletes data.

### Design system and interaction principles
- Visual direction: warm off-white, forest green, muted gold accents and a dark theme; rounded cards, friendly original icons, gentle celebration animation; no copied promotional imagery.
- Mobile-first bottom navigation: Today, Goals, Journal, Progress; Settings accessible from the header. Support desktop layout and narrow screens (320 px minimum target).
- Accessible controls, visible focus, descriptive labels, keyboard navigation, contrast target WCAG 2.2 AA, 44 px touch targets where practical, reduced-motion setting and text alternatives for charts. Never rely on color alone.
- Empty, loading, saving, success and recoverable-error states for each module. Avoid shame language, forced onboarding, intrusive prompts and red “failure” indicators.

<!-- PAGE -->
## 05 / Gamification, progress and behavioral rules

### BD-12 · Positive gamification
| Action | Proposed XP |
|---|---:|
| Morning affirmation | 5 |
| Sunlight, movement, water | 5 each upon meeting target |
| First daily gratitude entry | 5 |
| First recorded mindful decision | 5 |
| Sport/activity logged on eligible day | 10 |
| Digital sunset checklist complete | 5 |
| Evening reflection | 10 |
| Life vision first completed | 20 once |
| Custom habits | 5 each, maximum 10 XP/day |

- Daily cap 60 XP (life vision's one-time 20 excluded from cap); no points for thought journaling, prayer or other worship. If one movement session satisfies both movement and sport, award only the higher XP value for that shared record. XP rules are proposed defaults, not health measures.
- Level = 1 + floor(total earned XP / 100); badges: First Step (first qualifying action), Consistent Week (five active days in a seven-day window), Reflective Start (three evening reflections on distinct days), Gratitude Moments (ten distinct days with entries).
- No leaderboard, public ranking, loot boxes, loss of lives, paid rewards or punishments. Use a weekly consistency count instead of requiring an unbroken streak. A missed day is a fresh start, not a failure.
- Calculate XP deterministically from unique eligible completions; duplicate taps and edits do not inflate scores. Undo/delete recalculates relevant XP/levels/badges. Evaluate achievements from available records. Historical changes may update milestones; explain this unobtrusively.

### BD-13 · Progress and history
- Daily completion = completed scheduled enabled habits / scheduled enabled habits; skipped tasks remain visible as not completed, but do not generate penalties. Exclude on-demand journals/decision prompts and worship from general completion unless user explicitly schedules a nonreligious related habit; show faith check-ins separately without scoring.
- Freeze daily scheduled habit definitions/targets when a day is first opened or logged. Schedule changes apply from next local date unless user explicitly edits today's plan; unlogged earlier dates reconstruct from effective-date schedule history.
- Empty denominator: display “No habits scheduled,” not 0% or 100%. Weekly consistency = days with at least one completed scheduled general habit; rest days do not count as required tasks. Weekly report displays completed/scheduled counts and daily history; no invented wellness or brain scores.
**Acceptance:** Test duplicate clicks, undo, midnight, disabled habits, historical edits, no scheduled tasks, changing targets and overlapping activities. Identical data always produce identical metrics.

### Success measures (proposed pilot targets)
- At least 8 of 10 pilot participants complete onboarding without help; at least 7 can find all core actions unaided.
- At least 7 of 10 can complete backup and restore on a test profile; zero confirmed data-loss defects before release.
- Assess whether users find the experience encouraging rather than stressful through voluntary feedback. No hidden analytics; usage statistics remain on device unless voluntarily shared.

<!-- PAGE -->
## 06 / Technical architecture and data model

### Proposed stack
| Layer | Choice |
|---|---|
| UI | React + TypeScript + Vite; Tailwind CSS; Lucide icons |
| Data | IndexedDB via Dexie; Zod schema validation; typed repository layer |
| PWA | Web app manifest; service worker via Vite PWA/Workbox; cache app assets |
| Tests | Vitest + Testing Library; Playwright for browser/end-to-end testing |
| Delivery | GitHub Actions CI; Vercel preview and production HTTPS hosting |

UI components call feature services, which validate inputs, write transactions to IndexedDB and compute progress from stored records. The service worker caches versioned app assets, not journal responses. No external API, account or cloud database is needed. Pin dependency versions and commit the lockfile; select supported versions at implementation.

### Logical data model
| Store | Key fields / purpose |
|---|---|
| settings | id, mode, locale, timezone, theme, bedtime, schemaVersion |
| goals | id, category, title, description, createdAt, updatedAt |
| habits + revisions | id, label, type, target/unit, weekdays, effectiveDate, goalId, archived |
| dailyPlans | localDate, timezone, immutable habit snapshot; explicit revisions if edited |
| habitLogs | id, habitId, localDate, status, amount, timestamp; unique completion per habit/day |
| journalEntries | id, type, localDate, structured text, tags, draft, createdAt, updatedAt |
| activityLogs | id, localDate, activity, minutes, linkedHabitId, timestamps |
| faithLogs | localDate, practiceId, status/count; separate from XP |
| priorities | id, localDate, title, done, goalId |

### Data and time rules
Use stable UUIDs, UTC timestamps for audit and explicit YYYY-MM-DD local-date keys for routine grouping. Preserve the date and time zone recorded with each entry when traveling. Recalculate the current day when app resumes or crosses local midnight; use user-selected date for backdated entries. Validate numeric range and text length; never silently truncate. All writes are transactional; show save errors and retry controls. Use revision/version migration tests for existing databases; never reset data automatically on upgrade.

### Privacy and PWA limits
- No telemetry SDK, external fonts, ads or journal content in logs; serve assets over HTTPS with restrictive CSP. Host infrastructure may still log ordinary request metadata; explain in privacy notice. Local storage is not encryption or protection from someone with device access.
- Request persistent storage where supported; browser clearing, storage eviction and changing site origin may remove or isolate data. Prompt for regular backups; verify write failures and restore. [1]
- First load requires network; subsequent core use offline depends on successful caching. Install instructions differ by platform. Do not promise reliable scheduled notifications while the app is closed without push infrastructure or a native wrapper. [2–3]

<!-- PAGE -->
## 07 / Quality, testing and release gates

### BD-14 · Backup and privacy controls (P0)
Export a versioned JSON file containing local profile records; warn that it contains sensitive readable content. Import validates schema, size, IDs, references and supported version, previews record counts, requests confirmation and replaces data atomically only after validation. Offer export of existing data before overwrite. Provide delete individual entries and “Delete all personal data” with explicit confirmation. Reset local records across open tabs and reinitialize safely; no automatic destructive migration.

### Test matrix
| ID | Critical scenario / expected result |
|---|---|
| T01 | First visit: onboarding skip/finish; reload retains state; no login |
| T02 | Offline after setup: all nine features read/write; reopen retains entries |
| T03 | Habit edits, undo, duplicates, weekly schedules and linked activities: accurate XP/progress |
| T04 | Midnight, timezone travel, leap day, DST and backdated logs: correct grouping |
| T05 | Backup round-trip: all stores restored; corrupt/unsupported file leaves data intact |
| T06 | Storage denied/full: error displayed; no false save message or silent data loss |
| T07 | Upgrade/service worker refresh: schema migrated and history preserved |
| T08 | Islamic mode toggle: contents isolated; RTL works; no religious XP |
| T09 | Journal input: XSS payload shown as inert text; blank/oversize inputs handled |
| T10 | Keyboard, screen reader, zoom, contrast, reduced motion and narrow layout |
| T11 | Install/update/reopen: Android Chrome, iOS Safari/Home Screen, desktop Chrome/Edge; Firefox web fallback |
| T12 | Two tabs, reload during save, reset and import interruption: no corruption; stale tabs refresh |

### Quality targets and release gate
- CI: lint, typecheck, unit tests, production build and browser tests pass; target 90% branch coverage for XP, date and backup business rules (not a substitute for behavior tests).
- Performance target: LCP under 2.5 seconds in a representative mobile test on a defined network; validate offline reopening and responsiveness with realistic history (365 days, 2,000 entries).
- Zero known P0/P1 defects (data loss, privacy/security flaw, unusable core flow, wrong date or points affecting core experience). Lower severity issues may ship only if documented and accepted by owner.
- Verify test matrix on real Android and iOS devices when available; clearly disclose untested devices. Run accessibility checks and manual keyboard/screen-reader review. Review all faith content and wellness wording.
- Confirm production domain, install manifest/icons, fallback, privacy notice, backup instructions, rollback and known issues. Retain a previous deployment; code rollback cannot automatically reverse schema migrations, so preserve compatible migrations/backups.

### Definition of done (each feature)
Acceptance criteria satisfied, automated tests where applicable, manual happy/edge cases exercised, responsive and accessible, offline behavior verified, no sensitive data leakage, documentation updated and owner review completed.

<!-- PAGE -->
## 08 / Development roadmap and project ownership

Use milestone gates rather than a guaranteed completion date. Work is performed in active sessions, with owner review and real device tests. All nine practices remain in scope; defer polish before dropping core functionality.

| Milestone | Deliverable / exit criterion |
|---|---|
| M0 · Foundation | Private repo, README, agreed scope, wireframes, initial CI and project board; owner approves |
| M1 · App shell | Responsive navigation, onboarding, IndexedDB, PWA install/offline shell, versioned migrations |
| M2 · Daily actions | Life vision, affirmation, daylight/movement/water, custom habits and Today dashboard; offline tests |
| M3 · Journals & sport | Gratitude, decision filter, thought journal, sports, digital sunset, evening reflection; all nine usable |
| M4 · Personalization | Optional Islamic mode, XP/achievements, progress/history, settings, backup/restore and reset |
| M5 · Stabilization | Full test matrix, accessibility, security review, pilot feedback; zero open critical defects |
| M6 · Release | Production deployment, install guide, privacy notice, release notes, owner sign-off |
| Post-MVP | Evaluate optional cloud sync, reminder architecture, languages, deeper analytics and other enhancements |

### Repository structure
`src/features/{today,goals,habits,journal,activity,faith,progress,settings}`; `src/components`; `src/domain` (date/XP/schedules); `src/db` (schemas, repositories, migrations); `src/pwa`; `tests/unit`, `tests/e2e`; `public` (manifest/icons); `docs` (PRD, architecture, test plan, decisions). Use pull requests, protected main if available, milestone issues and preview deployments; never put real personal data into fixtures or commits.

### Owner's first actions
1. Create a private GitHub repository named `betterdaily` (or authorize creation), with a README. Keep ownership in your own account; no password or access token sharing.
2. Create or connect a Vercel account for preview deployment. No domain, database or paid service needed for initial development; confirm hosting terms before public release.
3. Approve the MVP baseline, especially point rules and optional faith features. Choose a final logo/name after trademark/domain checks if publishing publicly.
4. Test using fictitious entries on your desktop and Android/iOS devices; report device, browser, steps, expected vs actual behavior and screenshot with sensitive text removed.

### Main risks and mitigations
Data loss → backup, migration/restore tests; scope creep → milestone gates; gamification pressure → opt-out and no penalties; PWA reminder limitations → in-app schedules; faith accuracy → sourced content review; name conflicts → clearance before publication.

### Technical references
[1] MDN — Storage quotas and eviction: https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria
[2] MDN — Making PWAs installable: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable
[3] MDN — Offline and background operation: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation

**Next deliverable:** M0 repository scaffold, original design system and a tested app shell. This document is the baseline; changes should be versioned, reviewed and recorded before implementation.