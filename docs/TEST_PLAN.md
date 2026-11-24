# Test plan

## Initial shell gate
- npm install (review and commit lockfile), lint, typecheck, unit tests, build.
- Playwright Chromium: onboarding, navigation, settings persistence, faith mode default off and opt-in, offline reload after service worker ready.
- Manual Android/iOS/desktop: narrow layout, focus, contrast, installation and offline launch. Check storage denial and update behavior.
- Verify no user data leaves the device; no real personal data in tests.

## MVP gate
All PRD T01–T12, including backup roundtrip, failed storage, midnight/timezone/DST, migrations, cross-tab updates, religious content accuracy, and data loss/security checks. Zero known P0/P1 issues before release. Tests in this branch are authored, not evidence that they have passed. Record CI results and owner acceptance before merge.

## M2a additional gate

Verify version 1 settings survive upgrade, six optional vision categories, rename/hide/edit/reload, invalid data rejection, separate faith/general affirmation text, date-keyed duplicate prevention, undo and offline write/reload. Check unsaved drafts before navigating, keyboard and mobile forms, and visible storage errors. CI and real-device review required before merge. Links, daily priorities and remaining habits are still outstanding.
