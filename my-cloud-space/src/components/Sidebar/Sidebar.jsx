import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';

const Sidebar = ({ activeView, setActiveView }) => {
  const [isOpen, setIsOpen] = useState(false);
  const {userData} = useContext(AppContext)

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const formatBytesToGB = (bytes) => {
  if (!bytes || bytes === 0) return '0 GB';
  
  const gb = bytes / (1024 * 1024 * 1024);
  
  // If less than 0.01 GB, show in MB
  if (gb < 0.01) {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  }
  
  // If less than 1 GB, show 2 decimal places
  if (gb < 1) {
    return `${gb.toFixed(2)} GB`;
  }
  
  // If greater than 1 GB, show 2 decimal places
  return `${gb.toFixed(2)} GB`;
};

  const menuItems = [
    { id: 'myfiles', name: 'My Files', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z' },
    { id: 'sharedfiles', name: 'Shared Files', icon: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z' },
    { id: 'summary', name: 'AI Summary', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
    { id: 'users', name: 'Manage Shared Files', icon: 'M16 19h4a1 1 0 0 0 1-1v-1a3 3 0 0 0-3-3h-2m-2.236-4a3 3 0 1 0 0-4M3 18v-1a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Zm8-10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z' },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={toggleSidebar}
        type="button"
        className="text-gray-800 bg-transparent hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg ms-3 mt-3 text-sm p-2 focus:outline-none inline-flex sm:hidden"
      >
        <span className="sr-only">Open sidebar</span>
        <svg className="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
          <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M5 7h14M5 12h14M5 17h10"/>
        </svg>
      </button>

      {/* Sidebar */}
      <aside
        id="default-sidebar"
        className={`fixed top-16 left-0 z-40 w-64 h-[calc(100vh-4rem)] transition-transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } sm:translate-x-0`}
        aria-label="Sidebar"
      >
        <div className="h-full px-3 py-4 overflow-y-auto bg-white/80 backdrop-blur-sm border-r border-gray-200/50 shadow-sm flex flex-col">
          
          {/* Main Menu Items */}
          <ul className="space-y-2 font-medium flex-1">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center px-3 py-2.5 rounded-xl transition-all ${
                    activeView === item.id
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100/50 hover:text-blue-600'
                  }`}
                >
                  <svg className="w-5 h-5 transition duration-75" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}/>
                  </svg>
                  <span className="ms-3">{item.name}</span>
                </button>
              </li>
            ))}
          </ul>

          {/* Storage Section - At Bottom */}
          <div className="mt-auto pt-4 border-t border-gray-200/50">
            {/* Storage Bar */}
            <div className="px-3 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-600">Storage Used</span>
                <span className="text-xs font-medium text-gray-500">{formatBytesToGB(userData.storageUsed)} / {userData.maxStorage} GB</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all" style={{width: '10%'}}></div>
              </div>
            </div>

            {/* Sign Out */}
            <a
              href="#"
              className="flex items-center px-3 py-2.5 text-gray-700 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100/50 hover:text-red-600 group transition-all"
            >
              <svg className="shrink-0 w-5 h-5 transition duration-75 text-gray-600 group-hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
              <span className="flex-1 ms-3 whitespace-nowrap">Sign Out</span>
            </a>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 sm:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </>
  );
};

export default Sidebar;