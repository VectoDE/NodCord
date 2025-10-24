# Folder Structure

The following overview highlights the most important directories and files in the project and explains their purpose. Use it to quickly locate relevant areas.

```text
NodCord/
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── LICENSE
├── README.md
├── SECURITY.md
├── docs/                   # Documentation, guides, and planning material
│   ├── guides/             # Step-by-step guides (installation, FAQ, support)
│   ├── meta/               # Meta documents such as this structure overview
│   ├── overview/           # Architecture and high-level descriptions
│   ├── planning/           # Roadmaps, task lists, and detailed migration plans
│   ├── process/            # Project processes (changelog, release plan, contribution guidelines)
│   └── reference/          # Technical references and deeper explanations
├── nodemon.json            # Dev server configuration for ts-node-dev
├── package.json            # Project dependencies and scripts
├── prisma/                 # Prisma schema, migrations, and seeds
│   ├── seeds/              # Seed data and initialization scripts
│   └── schema.prisma       # MySQL model definitions
├── tsconfig.json           # TypeScript compiler settings
├── dist/                   # Compiled output (created during builds)
└── src/                    # Application code (API, bot, client, etc.)
    ├── api/                # Express app, controllers, routes, middleware, helpers & services
    ├── bot/                # Discord bot with commands, events, and utilities
    ├── client/             # Frontend code/assets for the dashboard
    ├── config/             # Configuration files for API, bot, and server
    ├── database/           # Connection logic and database-specific helpers
    ├── models/             # Transitional Mongoose models (being replaced by Prisma)
    ├── public/             # Static assets (CSS, images, uploaded files)
    ├── scripts/            # Automation and maintenance scripts
    ├── server.ts           # Entry point for starting the server
    └── views/              # EJS templates for server-side rendering
```

> **Note:** Current work focuses on consolidating the TypeScript code and migrating from MongoDB/Mongoose to Prisma + MySQL. Coordinate changes in the `src/` area closely with the maintainer team.
