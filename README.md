# Project BSR

A NestJS application with Authentication, File Management, and Audit Trail features.

## Features

- Authentication with OAuth2 and PKCE
- File Upload and Management (Local/S3)
- Audit Trail System
- MongoDB Integration
- Logging and Monitoring (Winston, Sentry)
- Environment-based Configuration
- CI/CD Support

## Prerequisites

- Node.js (v16 or later)
- MongoDB (v5 or later)
- Docker (optional)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd project-bsr
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

For development:
```bash
cp src/config/env/development.env.example src/config/env/development.env
```

For production:
```bash
cp .env.example .env
```

4. Configure your environment variables in the respective `.env` files:

Development environment (`src/config/env/development.env`):
```env
MONGODB_URI=mongodb://localhost:27017/project-bsr
JWT_SECRET=your-jwt-secret-key
# ... other development-specific variables
```

Production environment (`.env`):
```env
MONGODB_URI=mongodb://localhost:27017/project-bsr
JWT_SECRET=your-jwt-secret-key
# ... other production-specific variables
```

## Development

1. Start the development server:
```bash
npm run start:dev
```

2. Run database migrations:
```bash
npm run migration:run
```

## Testing

```bash
# Unit tests
npm run test

# e2e tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Database Migrations

```bash
# Generate a migration
npm run migration:generate -- src/migrations/MigrationName

# Run migrations
npm run migration:run

# Revert last migration
npm run migration:revert
```

## Docker

1. Build the Docker image:
```bash
docker build -t project-bsr .
```

2. Run with Docker Compose:
```bash
docker-compose up -d
```

## API Documentation

### Authentication

- POST /auth/login - User login
- POST /auth/register - User registration
- POST /auth/refresh-token - Refresh access token
- POST /auth/logout - User logout

### File Management

- POST /files/upload - Upload file
- GET /files/:id - Get file details
- GET /files/download/:id - Download file
- DELETE /files/:id - Delete file
- POST /files/process - Process uploaded file

### Audit Trail

- GET /audit/logs - Get audit logs
- GET /audit/logs/:id - Get specific audit log
- GET /audit/logs/resource/:resourceId - Get logs for specific resource

## Security

- All endpoints are protected with JWT authentication
- File uploads are validated and sanitized
- Sensitive data is encrypted
- Rate limiting is implemented on authentication endpoints

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the ISC License. 