# NodCord Roadmap

## Overview

This roadmap outlines planned features, improvements, and milestones for NodCord. The main focus is migrating to a consistent TypeScript codebase with Prisma/MySQL and delivering stable bot and API features.

## Current Status

- **Version:** 2.0.0-alpha
- **Focus:** TypeScript/Prisma infrastructure, core modules, documentation

## Milestones

### 2.0.0-alpha – Establish the foundation

- [x] TypeScript build setup (`tsconfig.json`, `npm run build`, `npm run dev`)
- [x] Initialize the Prisma schema (`User`, `Role`, `Project`, `Ticket`)
- [x] Refresh documentation for installation, architecture, and contributing
- [x] Align the dev server with ts-node-dev/nodemon
- [ ] Provide initial Prisma migrations and seeds
- [ ] Migrate core modules (auth, user, tickets) to Prisma services

### 2.0.0-beta – Achieve feature parity

- [ ] Port all API modules to Prisma (commerce, blog, integrations, analytics)
- [ ] Switch bot commands to shared services and Prisma data access
- [ ] Establish integration tests and E2E workflows with a test database
- [ ] Publish a CI/CD pipeline covering build, test, Prisma migrate, and security checks

### 2.0.0 – Stable release

- [ ] Finalize the Prisma schema and freeze migrations
- [ ] Document upgrade guides and migration instructions
- [ ] Roll out monitoring/observability (logging, health checks, alerts)
- [ ] Publish release notes and the changelog

## Future Plans

- [ ] Multi-tenancy (organizations/teams with isolated workspaces)
- [ ] Extended analytics modules (dashboards, event tracking)
- [ ] Extensible bot plugin interfaces
- [ ] Infrastructure automation (Docker Compose, Helm charts)

## Contribute

We welcome community contributions! If you have ideas for features, improvements, or bug fixes, please open an issue or submit a pull request. Review our [contributing guidelines](../process/contributing.md) before you get started.

## Contact

If you have questions or suggestions, reach out to the project maintainer:

- **Email:** [tim.hauke@hauknetz.de](mailto:tim.hauke@hauknetz.de)
- **Discord:** `vecto.`

Thank you for your interest in NodCord! Let’s build something great together.
