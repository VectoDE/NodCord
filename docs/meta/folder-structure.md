# Folder Structure

The following overview highlights the most important directories and files in the project and explains their purpose. Use it to quickly locate relevant areas.

```text
NodCord/
├── .env.example            # Template for all environment variables
├── .github/                # Workflows, issue templates, Dependabot
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
├── nodemon.json            # Dev server configuration (nodemon with Node loaders)
├── package.json            # Project dependencies and scripts
├── prisma/                 # Prisma schema, client, and seeds (no migrations committed yet)
│   ├── seeds/              # Seed data and initialization scripts
│   ├── client.ts           # Prisma client setup
│   └── schema.prisma       # MySQL model definitions
├── scripts/                # Build, import-map, and start/stop/restart scripts
├── types/                  # Additional type declarations
├── uploads/                # Uploaded files
├── jest.config.cjs         # Jest configuration (multi-project)
├── tsconfig.json           # TypeScript compiler settings
├── dist/                   # Compiled output (created during builds)
└── src/                    # Application code (API, bot, client, etc.)
    ├── api/                # Express app (`app.ts`), controllers, routers, shared helpers, Passport config
    ├── assets/             # Static assets (CSS, images, JS, JSON, templates)
    ├── bot/                # Discord bot with commands, events, services, and utilities
    ├── client/             # Dashboard client: routers, EJS views, client library
    ├── configs/            # Configuration files
    ├── middlewares/        # Express middleware (auth, CORS, CSRF, rate limiting, ...)
    ├── services/           # Shared services (logger, Prisma, mail, Stripe, Socket.IO, ...)
    ├── utils/              # Utility helpers
    └── server.ts           # Entry point: starts API, bot, and client
```

> **Note:** Current work focuses on consolidating the TypeScript code and completing the move from MongoDB/Mongoose to Prisma + MySQL. The Mongoose models are no longer part of `src/`; the `mongoose` package is still listed in `package.json`. Coordinate changes in the `src/` area closely with the maintainer team.
