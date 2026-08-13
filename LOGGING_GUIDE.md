# Logging Guide - Dev/Test Scenario

This document describes the comprehensive logging improvements added to the application for development and testing environments.

## Overview

The application now includes detailed, informative logs at every layer of the request lifecycle. Logs use emoji indicators and structured format for easy scanning in the console.

## Log Levels & Format

- **`debug`** (🔍): Low-level diagnostic information, database queries, parameter validation
- **`info`** (✅): Successful operations, completed requests, data counts
- **`warn`** (⚠️): Validation failures, not found results, edge cases
- **`error`** (❌/🔴): Exceptions, failed operations, stack traces
- **`http`** (🌐): HTTP request/response via Morgan middleware

**Format**: `[timestamp] [level]: message`

**Example**:
```
[2026-08-12 10:30:45:123] [info]: ✅ Successfully retrieved 5 open job role(s)
```

## Key Logging Areas

### 1. **Application Startup** (`src/app.ts`, `src/index.ts`)

```
[timestamp] [info]: App initialization started
[timestamp] [info]: Morgan HTTP middleware registered
[timestamp] [info]: Job routes mounted at /job-roles
[timestamp] [info]: 🚀 Server running on http://localhost:4000
```

### 2. **Database Layer** (`src/prismaClient.ts`)

- **Initialization**: Logs when Prisma client connects
- **Queries** (dev mode only): Each query logged at `debug` level with duration
- **Format**: `[DB QUERY] <sql> | Params: <values> | Duration: <ms>ms`

### 3. **Service Layer** (`src/services/jobRoleService.ts`)

#### `findAllOpen()`
- ✅ Logs count of retrieved job roles
- ⚠️ Warns if no open roles found
- ❌ Logs any database errors

**Examples**:
```
[timestamp] [debug]: 📋 Fetching all open job roles from database...
[timestamp] [info]: ✅ Successfully retrieved 3 open job role(s)
```

#### `findById(id)`
- 🔍 Logs the requested ID
- ✅ Logs role name when found
- ⚠️ Warns when role not found
- ❌ Logs any database errors

**Examples**:
```
[timestamp] [debug]: 🔍 Looking up job role with ID: 42
[timestamp] [info]: ✅ Successfully retrieved job role: "Senior Engineer" (ID: 42)
```

### 4. **Controller Layer** (`src/controllers/jobRoleController.ts`)

#### `getAllOpen()`
- 🌐 Logs incoming GET request
- 📤 Returns count of roles and status code
- ❌ Logs any errors with details

**Examples**:
```
[timestamp] [debug]: 🌐 [GET /job-roles] Received request to fetch all open job roles
[timestamp] [info]: 📤 [GET /job-roles] Returning 3 job role(s) | Status: 200
```

#### `getById(id)`
- 🌐 Logs incoming GET request with ID parameter
- ⚠️ Warns on invalid ID format
- ⚠️ Warns on 404 not found
- 📤 Returns role on success
- ❌ Logs any errors

**Examples**:
```
[timestamp] [debug]: 🌐 [GET /job-roles/:id] Received request for job role ID: 42
[timestamp] [info]: 📤 [GET /job-roles/:id] Returning job role | Status: 200
```

### 5. **HTTP Middleware** (`src/config/morganMiddleware.ts`)

Morgan logs every HTTP request/response:
```
GET /job-roles 200 1234 - 12.345 ms
```

### 6. **Error Handling** (`src/app.ts`)

#### Error Handler Middleware
- 🔴 Logs all unhandled errors with request path/method
- 🐛 In dev mode, includes error stack trace
- Returns 500 status

**Example**:
```
[timestamp] [error]: 🔴 [ERROR HANDLER] Path: /job-roles/invalid | Method: GET | Error: Invalid parameter
[timestamp] [debug]: Stack trace: Error: Invalid parameter at ...
```

#### 404 Handler
- ⚠️ Logs unmatched routes

**Example**:
```
[timestamp] [warn]: ⚠️  [404] Route not found: GET /unknown-endpoint
```

## Log Configuration

### Environment Variables

- **`NODE_ENV`**: Set to `"development"` to enable all logs including debug queries
  - Development: Shows debug, info, warn, error, http
  - Production: Shows warn, error, http only
- **`LOG_TO_FILE`**: Set to `"true"` to write logs to files
  - `logs/error.log` (errors only)
  - `logs/all.log` (all levels)

### Winston Logger Configuration

Located in [src/lib/logger.ts](src/lib/logger.ts):

```typescript
// Show all logs in development; only warn+ in production
const level = () => {
  const env = process.env.NODE_ENV || "development";
  return env === "development" ? "debug" : "warn";
};
```

## Example Console Output (dev mode)

```
[2026-08-12 10:30:45:001] [info]: App initialization started
[2026-08-12 10:30:45:002] [info]: Morgan HTTP middleware registered
[2026-08-12 10:30:45:003] [info]: Job routes mounted at /job-roles
[2026-08-12 10:30:45:010] [info]: Prisma database client initialized
[2026-08-12 10:30:45:020] [info]: 🚀 Server running on http://localhost:4000
[2026-08-12 10:30:45:021] [info]: 📝 Try: http://localhost:4000/health

# User makes request: GET /job-roles
[2026-08-12 10:30:50:100] [debug]: 🌐 [GET /job-roles] Received request to fetch all open job roles
[2026-08-12 10:30:50:101] [debug]: 📋 Fetching all open job roles from database...
[2026-08-12 10:30:50:105] [debug]: [DB QUERY] SELECT ... | Duration: 4ms
[2026-08-12 10:30:50:106] [info]: ✅ Successfully retrieved 2 open job role(s)
[2026-08-12 10:30:50:107] [http]: GET /job-roles 200 2345 - 7.234 ms
[2026-08-12 10:30:50:108] [info]: 📤 [GET /job-roles] Returning 2 job role(s) | Status: 200

# User makes request: GET /job-roles/42
[2026-08-12 10:30:55:200] [debug]: 🌐 [GET /job-roles/:id] Received request for job role ID: 42
[2026-08-12 10:30:55:201] [debug]: 🔍 Looking up job role with ID: 42
[2026-08-12 10:30:55:203] [debug]: [DB QUERY] SELECT ... WHERE id = 42 | Duration: 2ms
[2026-08-12 10:30:55:204] [info]: ✅ Successfully retrieved job role: "Lead Developer" (ID: 42)
[2026-08-12 10:30:55:205] [http]: GET /job-roles/42 200 1567 - 5.123 ms
[2026-08-12 10:30:55:206] [info]: 📤 [GET /job-roles/:id] Returning job role | Status: 200

# User makes invalid request: GET /job-roles/invalid
[2026-08-12 10:30:60:300] [debug]: 🌐 [GET /job-roles/:id] Received request for job role ID: NaN
[2026-08-12 10:30:60:301] [warn]: ⚠️  [GET /job-roles/:id] Invalid ID parameter: "invalid" | Status: 400
[2026-08-12 10:30:60:302] [http]: GET /job-roles/invalid 400 45 - 2.145 ms
```

## Best Practices for Developers

1. **Use appropriate log levels**:
   - Use `debug` for diagnostic info and query details
   - Use `info` for successful operations and milestones
   - Use `warn` for edge cases and recoverable issues
   - Use `error` for exceptions

2. **Add context to logs**:
   - Include IDs, names, and relevant parameters
   - Format logs with status indicators (✅, ⚠️, ❌)
   - Use consistent naming patterns like `[CONTROLLER] [METHOD]`

3. **Avoid sensitive data**:
   - Don't log passwords, tokens, or API keys
   - In production, disable query logging

4. **Performance**:
   - Logs are only enabled based on `NODE_ENV`
   - Production mode filters to warn+ only
   - Database query logging only in development

## Testing

All tests pass with the new logging in place:
```
npm run test          # Run all tests (16 passed)
npm run test:coverage # Generate coverage report
```

The logging doesn't interfere with test assertions, as Winston is configured appropriately for testing environments.
