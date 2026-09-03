import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { assets } from '../../assets/assets';
import { useApp } from '../../hooks/useApp';
import Pricing from '../Pricing/Pricing';

const initialsOf = (name = '', email = '') => {
  const source = name.trim() || email.trim();
  if (!source) return '?';
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

const Navbar = ({ searchQuery, onSearchChange, onUploadClick }) => {
  const navigate = useNavigate();
  const { userData, signOut } = useApp();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!userMenuOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setUserMenuOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [userMenuOpen]);

  const handleSignOut = () => {
    setUserMenuOpen(false);
    signOut();
    toast.success('Signed out');
    navigate('/', { replace: true });
  };

  return (
    <>
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 shadow-sm fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center">
            <img className="h-10 w-16 object-contain" src={assets.logo} alt="MyCloudSpace" />
          </div>

          <div className="flex-1 max-w-2xl mx-6">
            <label htmlFor="search" className="sr-only">
              Search your files
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <svg
                  className="h-5 w-5 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <input
                id="search"
                name="search"
                className="block w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-9 text-sm placeholder-gray-400 focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                placeholder="Search your files"
                type="search"
                value={searchQuery}
                onChange={(event) => onSearchChange(event.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  aria-label="Clear search"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onUploadClick}
              className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 font-medium text-sm shadow-sm hover:shadow-md transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add New File
            </button>

            <button
              onClick={() => setShowPricingModal(true)}
              className="text-sm font-medium text-gray-700 hover:text-gray-900 whitespace-nowrap transition-colors"
            >
              Upgrade Storage
            </button>

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setUserMenuOpen((open) => !open)}
                aria-haspopup="menu"
                aria-expanded={userMenuOpen}
                aria-label="Account menu"
                className="flex items-center focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-full"
              >
                <span className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-semibold flex items-center justify-center ring-2 ring-gray-200/70 hover:ring-blue-300 transition-all">
                  {initialsOf(userData?.username, userData?.email)}
                </span>
              </button>

              {userMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200/50 py-2 z-50"
                >
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900 truncate">{userData?.username}</p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{userData?.email}</p>
                  </div>

                  <button
                    role="menuitem"
                    onClick={() => {
                      setUserMenuOpen(false);
                      setShowPricingModal(true);
                    }}
                    className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition-all"
                  >
                    <svg className="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 10l7-7m0 0l7 7m-7-7v18"
                      />
                    </svg>
                    Upgrade storage
                  </button>

                  <div className="border-t border-gray-100 mt-1" />

                  <button
                    role="menuitem"
                    onClick={handleSignOut}
                    className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-all"
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {userMenuOpen && (
          <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} aria-hidden="true" />
        )}
      </header>

      <Pricing isOpen={showPricingModal} onClose={() => setShowPricingModal(false)} />
    </>
  );
};

export default Navbar;
