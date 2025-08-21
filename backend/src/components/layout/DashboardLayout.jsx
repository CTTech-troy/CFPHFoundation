import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import  Sidebar  from './Sidebar';
import { MenuIcon, XIcon } from 'lucide-react';
export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-0 left-0 p-4 z-20">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-md bg-white shadow-md text-gray-600 hover:text-gray-900 focus:outline-none">
          {sidebarOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
        </button>
      </div>
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-10 w-64 transition-transform duration-300 ease-in-out transform bg-white border-r border-gray-200 shadow-lg lg:shadow-none`}>
        <Sidebar closeSidebar={() => setSidebarOpen(false)} />
      </div>
      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <main className="p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-0 lg:hidden" onClick={() => setSidebarOpen(false)}></div>}
    </div>;
}