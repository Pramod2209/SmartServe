import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

/**
 * Main layout wrapper for dashboard pages
 * Includes navbar, sidebar, and main content area
 */
const DashboardLayout = ({ 
  children, 
  userRole = 'customer', 
  userName = 'User',
  menuItems = [] 
}) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar userRole={userRole} userName={userName} />
      
      <div className="flex flex-1 pt-16">
        <Sidebar menuItems={menuItems} />
        
        <main className="flex-1 ml-64 p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default DashboardLayout;
