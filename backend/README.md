# Backend API

This is the backend API for the task management application. It provides endpoints for user authentication, task management, and activity tracking.

## Table of Contents

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Database Setup](#database-setup)
  - [Environment Variables](#environment-variables)
- [Running the Server](#running-the-server)
- [API Documentation](#api-documentation)
  - [Authentication](#authentication)
  - [User Management](#user-management)
  - [Task Management](#task-management)
  - [Activity Tracking](#activity-tracking)
- [Security](#security)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```

### Database Setup

1. Create a PostgreSQL database:
   ```
   createdb 
   ```

2. Run the database migration script:
   ```
   psql -d  -f database.sql
   ```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=remote
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_secret_key
JWT_EXPIRATION=24h

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_AUTH_MAX=5
RATE_LIMIT_API_MAX=100
```

## Running the Server

Development mode:
```
npm run dev
```

Production mode:
```
npm start
```

## API Documentation

### Authentication

#### Register a new user

```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!",
  "name": "John Doe"
}
```

#### Login

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!"
}
```

#### Logout

```
POST /api/auth/logout
Authorization: Bearer {token}
```

### User Management

#### Get current user information

```
GET /api/users/me
Authorization: Bearer {token}
```

#### Update current user information

```
PUT /api/users/me
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Name",
  "bio": "Updated bio",
  "oldPassword": "CurrentPassword123!",
  "newPassword": "NewPassword123!"
}
```

#### Get all users (admin only)

```
GET /api/users
Authorization: Bearer {token}
```

### Task Management

#### Get tasks

```
GET /api/tasks?status=todo&assignedTo={userId}
Authorization: Bearer {token}
```

#### Create a task

```
POST /api/tasks
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Task Title",
  "description": "Task Description",
  "assignedTo": "{userId}",
  "priority": "high"
}
```

#### Update a task

```
PUT /api/tasks/{taskId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated Description",
  "status": "inprogress",
  "assignedTo": "{userId}",
  "priority": "medium"
}
```

#### Delete a task

```
DELETE /api/tasks/{taskId}
Authorization: Bearer {token}
```

### Activity Tracking

#### Log activity

```
POST /api/activity
Authorization: Bearer {token}
Content-Type: application/json

{
  "mouseClicks": 10,
  "keyPresses": 50,
  "mouseMovements": 100,
  "timestamp": "2023-01-01T12:00:00Z"
}
```

#### Get activity stats

```
GET /api/activity/stats?userId={userId}&startDate=2023-01-01T00:00:00Z&endDate=2023-01-31T23:59:59Z
Authorization: Bearer {token}
```

## Security

- Password Requirements:
  - Minimum 6 characters
  - At least one number
  - At least one special character

- JWT Token:
  - 24-hour expiration
  - Contains user ID and role

- Rate Limiting:
  - Authentication endpoints: 5 requests per minute
  - API endpoints: 100 requests per minute per user

- Role-Based Access Control:
  - Admin: Full access
  - Manager: Can manage tasks and view activity stats
  - Worker: Can only manage assigned tasks and own profile