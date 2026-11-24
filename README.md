# BetterDaily

Small actions. Meaningful changes. Every day.

A free, gamified, local-first PWA for intentional living. No account, ads or cloud database required for the MVP.

## Development status

M2a in development: editable Life Vision categories and a daily Morning Affirmation check-in, stored locally. Goal-to-habit links, daily priorities, quantity tracking, journals, points, backup and faith tools remain planned. This is not the complete MVP. Use fictitious information only in development.

## Get started

Requirements: Node.js 24 LTS (or compatible supported Node 22.12+), npm and Git.

```sh
npm install
npm run dev
```

Open the localhost address Vite prints. Test the production PWA with:

```sh
npm run build
npm run preview
```

The service worker runs in production, not the development server. Install support varies by browser. First use requires a successful online visit. Browser data is not encrypted by this app and may be lost if storage is cleared.

## Checks

```sh
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Commit the generated package-lock.json after dependency resolution and switch to npm ci for reproducible builds. CI currently supports bootstrapping without a lockfile.

## Project documentation

- [Product requirements](docs/PRD.md)
- [Design system](docs/DESIGN_SYSTEM.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Test plan](docs/TEST_PLAN.md)
- [Roadmap](docs/ROADMAP.md)
- [Decisions](docs/DECISIONS.md)

Keep user journals, backups, credentials and personal data out of Git. The existing repository license is retained.
