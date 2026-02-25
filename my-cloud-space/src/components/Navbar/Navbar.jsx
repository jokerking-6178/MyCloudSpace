import React, { useState } from 'react';
import { assets } from '../../assets/assets';
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import FileUpload from '../FileUpload/FileUpload';
import Pricing from '../Pricing/Pricing';

const Navbar = () => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const {userData} = useContext(AppContext)

  return (
    <>
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 shadow-sm fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center justify-between px-6 py-3">
          {/* Logo */}
          <div className="flex items-center">
            <img className="h-10 w-16" src={assets.logo} alt="Your Company" />
          </div>

          {/* Search Bar - closer to logo */}
          <div className="flex-1 max-w-2xl mx-6">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                id="search"
                name="search"
                className="block w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-3 text-sm placeholder-gray-400 focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                placeholder="Search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Right side buttons */}
          <div className="flex items-center gap-4">
            {/* Add New File Button with + icon */}
            <button 
              onClick={() => setShowUploadModal(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 font-medium text-sm shadow-sm hover:shadow-md transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
              </svg>
              Add New File
            </button>

           {/* Upgrade Button */}
            <button 
              onClick={() => setShowPricingModal(true)}
              className="text-sm font-medium text-gray-700 hover:text-gray-900 whitespace-nowrap transition-colors"
            >
              Upgrade To Unlimited
            </button>

            {/* Avatar with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center focus:outline-none"
              >
                <img 
                  className="h-10 w-10 rounded-full cursor-pointer ring-2 ring-gray-200/70 hover:ring-blue-300 transition-all" 
                  src="https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                  alt="Profile" 
                />
              </button>

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200/50 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{userData.username}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{userData.email}</p>
                  </div>
                  <a
                    href="#"
                    className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100/50 transition-all"
                  >
                    <svg className="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    Edit Profile
                  </a>
                  <a
                    href="#"
                    className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100/50 transition-all"
                  >
                    <svg className="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    Change Profile Image
                  </a>

                  <a
                    href="#"
                    className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100/50 transition-all"
                  >
                    <svg className="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    Settings
                  </a>

                  <div className="border-t border-gray-100 mt-1"></div>

                  <a
                    href="#"
                    className="flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-all"
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                    </svg>
                    Sign Out
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Click outside to close dropdown */}
        {userMenuOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setUserMenuOpen(false)}
          ></div>
        )}
      </header>

      {/* File Upload Modal */}
      <FileUpload 
        isOpen={showUploadModal} 
        onClose={() => setShowUploadModal(false)} 
      />
      <Pricing
        isOpen={showPricingModal} 
        onClose={() => setShowPricingModal(false)} 
      />
    </>
  );
};

export default Navbar;