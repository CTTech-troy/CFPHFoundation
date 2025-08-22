import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  HomeIcon, ImageIcon, MessageSquareQuoteIcon, PackageIcon, 
  DollarSignIcon, UsersIcon, CalendarIcon, FileTextIcon, 
  HelpCircleIcon, InboxIcon, MailIcon, CameraIcon, BarChart3Icon 
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext'; // import context

export default function Sidebar({ closeSidebar }) {
  const { user } = useContext(AuthContext);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <HomeIcon size={18} /> },
    { path: '/media', label: 'Media Manager', icon: <ImageIcon size={18} /> },
    { path: '/testimonials', label: 'Testimonials', icon: <MessageSquareQuoteIcon size={18} /> },
    // { path: '/programs', label: 'Programs', icon: <PackageIcon size={18} /> },
    // { path: '/donations', label: 'Donations', icon: <DollarSignIcon size={18} /> },
    { path: '/volunteers', label: 'Volunteers', icon: <UsersIcon size={18} /> },
    { path: '/events', label: 'Events', icon: <CalendarIcon size={18} /> },
    { path: '/blog', label: 'Blog', icon: <FileTextIcon size={18} /> },
    // { path: '/google-ads', label: 'Google Ads', icon: <BarChart3Icon size={18} /> },
    { path: '/faq', label: 'FAQ', icon: <HelpCircleIcon size={18} /> },
    { path: '/submissions', label: 'Form Submissions', icon: <InboxIcon size={18} /> },
    { path: '/newsletter', label: 'Newsletter', icon: <MailIcon size={18} /> },
    // { path: '/highlights', label: 'Event Highlights', icon: <CameraIcon size={18} /> }
  ];

  const handleClick = () => {
    if (closeSidebar) closeSidebar();
  };

  // Extract display name from email
  const displayName = user?.email ? user.email.split('@')[0] : 'Admin';
  const displayEmail = user?.email || 'admin@ngo.org';
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <div className="h-full flex flex-col">
      <div className="p-6">
        <h1 className="text-xl font-bold text-green-700">CFPHFoundation</h1>
      </div>
      <nav className="flex-1 overflow-y-auto">
        <ul className="space-y-1 px-4">
          {navItems.map(item => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                onClick={handleClick}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-sm rounded-lg ${
                    isActive
                      ? 'bg-green-100 text-green-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
            <span className="font-semibold">{initials}</span>
          </div>
          <div className="ml-3" id="user-info">
            <p className="text-sm font-medium text-gray-700">{displayName}</p>
            <p className="text-xs text-gray-500">{displayEmail}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
