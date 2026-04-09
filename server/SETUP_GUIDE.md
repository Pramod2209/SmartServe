# Backend Setup Guide

## Prerequisites

1. **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
2. **PostgreSQL** (v12 or higher) - [Download](https://www.postgresql.org/download/)

---

## Step 1: Install PostgreSQL

### Windows
1. Download PostgreSQL installer from https://www.postgresql.org/download/windows/
2. Run installer and follow the setup wizard
3. Remember the password you set for the `postgres` user
4. Default port: 5432

### Verify Installation
Open Command Prompt or PowerShell:
```bash
psql --version
```

---

## Step 2: Create Database

### Method 1: Using pgAdmin (GUI)
1. Open pgAdmin (installed with PostgreSQL)
2. Connect to PostgreSQL server
3. Right-click "Databases" → "Create" → "Database"
4. Name: `smart_serve`
5. Click "Save"

### Method 2: Using Command Line
```bash
# Login to PostgreSQL
psql -U postgres

# Enter your postgres password when prompted

# Create database
CREATE DATABASE smart_serve;

# Verify database was created
\l

# Exit
\q
```

---

## Step 3: Run Database Schema

```bash
# Navigate to server directory
cd server

# Run schema file (Windows)
psql -U postgres -d smart_serve -f database/schema.sql

# Enter postgres password when prompted
```

This will:
- Create all tables (users, services, bookings, technicians, reviews)
- Insert sample services
- Create default admin account
- Add indexes for performance

**Default Admin Credentials:**
- Email: `admin@example.com`
- Password: `admin123`

---

## Step 4: Configure Environment Variables

```bash
# The .env file is already created with default values
# Edit if needed (especially DB_PASSWORD)

# Open .env file in notepad
notepad .env
```

Update these values if needed:
```env
DB_PASSWORD=your_postgres_password_here
JWT_SECRET=change_this_to_a_random_secure_string
```

---

## Step 5: Install Dependencies

```bash
# Make sure you're in the server directory
cd server

# Install all npm packages
npm install
```

This will install:
- express (web framework)
- pg (PostgreSQL client)
- bcryptjs (password hashing)
- jsonwebtoken (authentication)
- cors (cross-origin requests)
- dotenv (environment variables)

---

## Step 6: Start the Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

You should see:
```
╔═══════════════════════════════════════╗
║   Smart Serve API Server Started     ║
║   Port: 5000                          ║
║   Environment: development            ║
║   URL: http://localhost:5000          ║
╚═══════════════════════════════════════╝
✅ Database connected successfully
```

---

## Step 7: Test the API

Open browser or use Postman:
```
http://localhost:5000/health
```

You should see:
```json
{
  "status": "ok",
  "message": "Smart Serve API is running",
  "timestamp": "2026-03-07T..."
}
```

---

## Step 8: Start Frontend

In a new terminal:
```bash
# Navigate to project root
cd ..

# Start frontend
npm run dev
```

Frontend will run on: http://localhost:5173
Backend API runs on: http://localhost:5000

---

## Troubleshooting

### "Connection refused" or "ECONNREFUSED"
- PostgreSQL service is not running
- Solution: Start PostgreSQL service
  - Windows: Open Services → PostgreSQL → Start

### "password authentication failed"
- Wrong password in `.env` file
- Solution: Update `DB_PASSWORD` in server/.env

### "database does not exist"
- Database not created
- Solution: Run `CREATE DATABASE smart_serve;` in psql

### "relation does not exist"
- Schema not run
- Solution: Run schema file: `psql -U postgres -d smart_serve -f database/schema.sql`

### Port 5000 already in use
- Another application is using port 5000
- Solution: Change `PORT=5001` in server/.env

---

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user (requires token)

### Services
- GET `/api/services` - Get all services
- GET `/api/services/:id` - Get service by ID
- POST `/api/services` - Create service (admin)
- PUT `/api/services/:id` - Update service (admin)
- DELETE `/api/services/:id` - Delete service (admin)

### Bookings
- GET `/api/bookings` - Get all bookings (filtered by role)
- GET `/api/bookings/:id` - Get booking by ID
- POST `/api/bookings` - Create booking (customer)
- PUT `/api/bookings/:id` - Update booking
- DELETE `/api/bookings/:id` - Cancel booking

### Users
- GET `/api/users` - Get all users (admin)
- GET `/api/users/:id` - Get user by ID
- PUT `/api/users/:id` - Update user
- DELETE `/api/users/:id` - Delete user (admin)

### Technicians
- GET `/api/technicians` - Get all technicians
- GET `/api/technicians/:id` - Get technician by ID
- PUT `/api/technicians/:id` - Update technician
- PUT `/api/technicians/:id/verify` - Verify technician (admin)

---

## Next Steps

1. Start both frontend and backend servers
2. Login with admin account: `admin@example.com` / `admin123`
3. Create customer and technician accounts
4. Test booking functionality
5. Change default admin password in production!

---

## Production Deployment

For production deployment:
1. Change `JWT_SECRET` to a strong random string
2. Use environment-specific database credentials
3. Set `NODE_ENV=production`
4. Use a process manager like PM2
5. Set up SSL certificates
6. Use a production PostgreSQL instance (not localhost)

Recommended hosting platforms:
- **Backend**: Render, Railway, Heroku
- **Database**: Render PostgreSQL, AWS RDS, Supabase
- **Frontend**: Vercel, Netlify

