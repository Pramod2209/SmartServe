# Backend Setup Guide

## Prerequisites

1. **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
2. **Neon account/project** - [Neon](https://neon.tech/)
3. **psql client** (optional, to run schema manually)

---

## Step 1: Initialize Neon Database

Run the Neon CLI initializer:
```bash
npx neonctl@latest init
```

This creates/selects a Neon project and gives you a pooled `DATABASE_URL` connection string.

---

## Step 2: Configure Environment Variables

```bash
# The .env file is already present
notepad .env
```

Set the Neon URL in `.env`:
```env
DATABASE_URL=postgresql://<user>:<password>@<host>/<db>?sslmode=require
JWT_SECRET=change_this_to_a_random_secure_string
```

Optional fallback vars (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`) are only used if `DATABASE_URL` is empty.

---

## Step 3: Run Database Schema

```bash
# Navigate to server directory
cd server

# Run schema file against Neon
psql "<YOUR_DATABASE_URL>" -f database/schema.sql
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

## Step 4: Install Dependencies

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

## Step 5: Start the Server

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

## Step 6: Test the API

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

## Step 7: Start Frontend

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
- `DATABASE_URL` is incorrect or Neon project/branch is unavailable
- Solution: Re-run `npx neonctl@latest init` and paste the new pooled URL

### "password authentication failed"
- Wrong credentials in `DATABASE_URL`
- Solution: regenerate and replace `DATABASE_URL`

### "database does not exist"
- The Neon DB/branch in your URL does not exist
- Solution: create the branch/db in Neon and update `DATABASE_URL`

### "relation does not exist"
- Schema not run
- Solution: Run schema file: `psql "<YOUR_DATABASE_URL>" -f database/schema.sql`

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
- **Database**: Neon, Render PostgreSQL, AWS RDS, Supabase
- **Frontend**: Vercel, Netlify

