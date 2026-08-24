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

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **PostgreSQL** (v12 or higher)
- **Git**

## Installation

1. Clone the repository:

```bash
git clone https://github.com/derry-academy-students-2026/team1-backend.git
cd team1-backend
```

2. Install dependencies:

```bash
npm install
```

3. Set up PostgreSQL with Docker:

Start a PostgreSQL container:

```bash
docker run --name jobRole-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=jobRole -p 4432:5432 -d postgres
```

4. Set up your environment variables:

Create a `.env` file in the root directory:

```bash
DATABASE_URL="postgresql://postgres:password@localhost:4432/jobRole"
NODE_ENV="development"
PORT=4000
```

5. Run database migrations:

```bash
npx prisma migrate dev --name init
```

6. Seed the database (optional):

```bash
npx prisma db seed
```

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

The included multi-stage `Dockerfile` builds the TypeScript application, generates
the Prisma client, and creates a separate production image with only runtime
dependencies and compiled code.

On macOS, export the corporate proxy certificate from the System keychain before
building the image:

```bash
npm run certs:export
```

Then build the image from the repository root:

```bash
docker build -t team1-backend:local .
```

Run it with the API exposed on port 4000:

```bash
docker run --rm --name team1-backend --env-file .env -p 4000:4000 team1-backend:local
```

When PostgreSQL runs on the Mac host, set `DATABASE_URL` in `.env` to use
`host.docker.internal` rather than `localhost`, for example:

```bash
DATABASE_URL="postgresql://postgres:password@host.docker.internal:4432/jobRole"
```

Verify the running API and view its logs:

```bash
curl http://localhost:4000/health
docker logs -f team1-backend
```

The build trusts `certs/KAINOS-ZSCALER G2_2026.pem` so npm and Prisma can make
HTTPS requests through the Kainos Zscaler proxy. Replace this certificate before
its 30 August 2026 expiry if the corporate certificate is renewed.

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
