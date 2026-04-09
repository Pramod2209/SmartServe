# Smart Serve Backend API

Backend server for the Smart Serve home services application.

## Setup Instructions

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Database Setup

#### Install PostgreSQL
- **Windows**: Download from https://www.postgresql.org/download/windows/
- **Mac**: `brew install postgresql`
- **Linux**: `sudo apt-get install postgresql`

#### Create Database
```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE smart_serve;

# Exit
\q
```

#### Run Database Schema
```bash
psql -U postgres -d smart_serve -f database/schema.sql
```

### 3. Environment Configuration
```bash
# Copy example env file
cp .env.example .env

# Edit .env and add your database credentials
```

### 4. Start Server
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

Server will run on http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Services
- `GET /api/services` - Get all services
- `GET /api/services/:id` - Get service by ID
- `POST /api/services` - Create service (admin only)
- `PUT /api/services/:id` - Update service (admin only)
- `DELETE /api/services/:id` - Delete service (admin only)

### Bookings
- `GET /api/bookings` - Get all bookings (filtered by role)
- `GET /api/bookings/:id` - Get booking by ID
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking

### Users (Admin only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Technicians
- `GET /api/technicians` - Get all technicians
- `GET /api/technicians/:id` - Get technician by ID
- `PUT /api/technicians/:id/availability` - Update availability

## Database Schema

See `database/schema.sql` for complete database structure.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
