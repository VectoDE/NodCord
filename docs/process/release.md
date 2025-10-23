## Release Process

This guide describes how to create a new release of NodCord.

### Steps

1. **Update the version**
   - Bump the version inside `package.json`.
   - Add an entry with version number and date to `docs/process/changelog.md`.

2. **Verify Prisma**
   - Ensure all migrations are committed (`prisma/migrations`).
   - Run `npm run prisma:migrate` against a fresh MySQL instance.
   - Regenerate the Prisma Client (`npm run prisma:generate`).

3. **Tests & builds**
   - `npm run build`
   - `npm test`
   - Optionally run smoke tests against a staging environment.

4. **Code freeze**
   - Block new features; only critical fixes are allowed.
   - Review open pull requests and issues.

5. **Create the release**
   - Tag the release on GitHub (`git tag vX.Y.Z && git push origin vX.Y.Z`).
   - Copy the release notes from the changelog.

6. **Publish**
   - Merge the release branch into `main`.
   - Run Prisma migrations in production.
   - Enable monitoring and alerts.

7. **Follow-up**
   - Highlight the release on the roadmap.
   - Gather feedback from the community.
