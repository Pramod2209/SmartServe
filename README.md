# Smart Serve - Home Services Platform

A professional, desktop-focused web application that connects customers with home service technicians.

## Features

- **Three User Roles**: Customer, Technician, and Admin
- **Service Categories**: Electrician, Plumber, Cleaning, AC Repair, Appliance Repair
- **Desktop-First Design**: Optimized for laptops and desktop computers
- **Modern Tech Stack**: React.js, Tailwind CSS, React Router DOM

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

The application will start at `http://localhost:3000`

## Build

```bash
npm run build
```

## Project Structure

```
src/
├── components/        # Reusable UI components
├── layouts/          # Layout components (Navbar, Sidebar, Footer)
├── pages/            # Page components organized by role
├── utils/            # Utility functions and mock data
├── App.jsx           # Main app component with routing
└── main.jsx          # Application entry point
```

## User Roles & Access

### Customer
- Dashboard with booking summary
- Book new services
- View service history
- Manage profile

### Technician
- View assigned jobs
- Update job status
- Work history
- Profile management

### Admin
- Analytics dashboard
- Manage services, technicians, and bookings
- User management

## Default Login Credentials (Mock)

**Customer**: customer@example.com / password123
**Technician**: technician@example.com / password123
**Admin**: admin@example.com / password123

---

© 2026 Smart Serve. All rights reserved.
