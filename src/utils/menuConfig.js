import {
  LayoutDashboard,
  Calendar,
  ClipboardList,
  User,
  Wrench,
  Users,
  Settings,
  Briefcase,
  History,
} from 'lucide-react';

/**
 * Menu configurations for different user roles
 */

export const CUSTOMER_MENU = [
  {
    label: 'Dashboard',
    path: '/customer/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Book Service',
    path: '/customer/book-service',
    icon: Calendar,
  },
  {
    label: 'My Services',
    path: '/customer/services',
    icon: ClipboardList,
  },
  {
    label: 'Profile',
    path: '/customer/profile',
    icon: User,
  },
];

export const TECHNICIAN_MENU = [
  {
    label: 'Dashboard',
    path: '/technician/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Assigned Jobs',
    path: '/technician/assigned-jobs',
    icon: Briefcase,
  },
  {
    label: 'Work History',
    path: '/technician/work-history',
    icon: History,
  },
  {
    label: 'Profile',
    path: '/technician/profile',
    icon: User,
  },
];

export const ADMIN_MENU = [
  {
    label: 'Dashboard',
    path: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Manage Services',
    path: '/admin/services',
    icon: Wrench,
  },
  {
    label: 'Manage Technicians',
    path: '/admin/technicians',
    icon: Settings,
  },
  {
    label: 'Manage Bookings',
    path: '/admin/bookings',
    icon: Calendar,
  },
  {
    label: 'User Management',
    path: '/admin/users',
    icon: Users,
  },
];
