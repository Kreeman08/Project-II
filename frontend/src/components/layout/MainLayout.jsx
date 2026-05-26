import React from 'react';
import SidebarNav from './SidebarNav';
import TopNav from './TopNav';

const MainLayout = ({ children }) => {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <SidebarNav />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden md:ml-0">
        {/* Top Navigation */}
        <TopNav />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
