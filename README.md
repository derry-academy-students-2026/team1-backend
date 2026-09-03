# team1-backend

A RESTful API backend built with Express, TypeScript, and PostgreSQL using Prisma ORM.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Building for Production](#building-for-production)
- [Testing](#testing)
- [Database Migrations](#database-migrations)
- [Linting and Code Quality](#linting-and-code-quality)
- [Project Structure](#project-structure)
- [Technologies](#technologies)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v24.15.0 or higher)
- **npm** (v12.0.2)
- **Docker Desktop** (or Docker Engine with Compose v2)
- **Git**

The project lockfile is generated and validated with npm 12.0.2. Verify your
version before installing dependencies. `npm install` and `npm ci` fail before
dependency resolution when Node or npm does not meet these requirements:

```bash
npm --version
```

If it does not report `12.0.2`, install the required version:

```bash
npm install --global npm@12.0.2
```

## Installation

1. Clone the repository:

```bash
git clone https://github.com/derry-academy-students-2026/team1-backend.git
cd team1-backend
```

2. Install dependencies with npm 12.0.2:

```bash
npm install
```

3. Create your local environment file:

```bash
cp .env.example .env
```

The provided values are for local development only. Set a unique `JWT_SECRET`
before deploying the application.

4. Start PostgreSQL, apply all committed migrations, and seed the database:

```bash
npm run db:setup
```

This starts a named Docker volume for PostgreSQL and waits for it to be ready,
so no separate container name, hostname, or connection command is required.

## Running the Application

### Development Mode

Start the development server with hot-reload:

```bash
npm run dev
```

The API will be available at `http://localhost:4000` (or the port specified in your configuration).

### Production Mode

First, build the application:

```bash
npm run build
```

Then start the server:

```bash
npm start
```

## Building for Production

Compile TypeScript to JavaScript:

```bash
npm run build
```

This will generate compiled files in the `dist/` directory.

## Docker

On a Kainos-managed macOS device, first export the corporate proxy certificate
from the System keychain:

```bash
npm run certs:export
```

When building through the Kainos Zscaler proxy, use the exported certificate as
a BuildKit secret:

```bash
docker build --secret id=corporate_ca,src="certs/KAINOS-ZSCALER G2_2027.pem" --tag team1-backend:local .
```

The certificate remains local and is not copied into the image. GitHub-hosted
runners do not need this secret.

To run the complete application in Docker, including PostgreSQL, migrations, and
seed data, run this command from the repository root:

```bash
npm run docker:up
```

`docker:up` automatically passes the exported certificate bundle to both Docker
image builds.

The API is available at `http://localhost:4000`. Compose connects the API to
PostgreSQL over its internal `db` hostname, so no machine-specific database URL
or Docker networking configuration is required.

Verify the running API and view its logs:

```bash
curl http://localhost:4000/health
docker compose logs -f api
```

Stop the application and remove its containers with:

```bash
npm run docker:down
```

Repeat the export if the corporate certificate is renewed.

## Testing

### Run Tests (Once)

Execute all tests:

```bash
npm run test
```

### Watch Mode

Run tests in watch mode for continuous development:

```bash
npm run test:watch
```

### Test UI

View test results in an interactive UI:

```bash
npm run test:ui
```

### Coverage Report

Generate a coverage report:

```bash
npm run test:coverage
```

Coverage reports are generated in the `coverage/` directory.

## Database Migrations

### Create a New Migration

```bash
npx prisma migrate dev --name <migration_name>
```

Example:

```bash
npx prisma migrate dev --name add_user_table
```

### Apply Pending Migrations

```bash
npx prisma migrate deploy
```

### Reset Database (Development Only)

⚠️ **Warning**: This will delete all data in your database.

```bash
npx prisma migrate reset
```

### Seed the Database

Populate the database with initial data:

```bash
npx prisma db seed
```

### View Database Schema

Open Prisma Studio to browse and edit your database:

```bash
npx prisma studio
```

## Linting and Code Quality

### Check Code

Run linting checks using Biome:

```bash
npm run lint
```

### Fix Code Issues

Automatically fix linting issues:

```bash
npm run lint:fix
```

## Logging guide

Read LOGGING_GUIDE.md for further information on where logs have been added and why within project alongside best practices 
(/team-project/team1-backend/LOGGING_GUIDE.md)

## Project Structure

```
src/
├── app.ts              # Express application setup
├── index.ts            # Application entry point
├── prismaClient.ts     # Prisma client initialization
├── config/             # Configuration files
│   └── morganMiddleware.ts
├── controllers/        # Request handlers
│   ├── healthController.ts
│   └── jobRoleController.ts
├── dtos/               # Data Transfer Objects
│   └── jobRoleDto.ts
├── lib/                # Utilities and helpers
│   └── logger.ts
├── mappers/            # Data mappers (entity ↔ DTO)
│   └── jobRoleMapper.ts
├── routes/             # Route definitions
│   ├── healthRouter.ts
│   └── jobRolesRouter.ts
└── services/           # Business logic
    ├── healthService.ts
    └── jobRoleService.ts

prisma/
├── schema.prisma       # Database schema
├── seed.ts             # Database seed script
└── migrations/         # Migration history

tests/
├── app.test.ts
├── controllers/
├── lib/
├── routes/
└── services/
```

## Technologies

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Testing**: Vitest & Supertest
- **Linting**: Biome
- **Logging**: Winston & Morgan
- **Package Manager**: npm

## Infrastructure and Deployment

The Docker image, Terraform configuration, remote-state bootstrap instructions, and GitHub Actions setup are documented in [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md).

## API Documentation

Health Check:

```bash
GET /api/health
```

Job Roles:

```bash
GET /api/job-roles
GET /api/job-roles/:id
POST /api/job-roles
PUT /api/job-roles/:id
DELETE /api/job-roles/:id
```

For detailed API documentation, see the route handlers in `src/routes/`.

## License

This project is part of the Derry Academy 2026 cohort.

## Support

For issues and questions, please visit the [GitHub Issues](https://github.com/derry-academy-students-2026/team1-backend/issues) page.
