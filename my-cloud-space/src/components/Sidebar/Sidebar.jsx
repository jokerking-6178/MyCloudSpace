import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useApp } from '../../hooks/useApp';

const GB = 1024 * 1024 * 1024;

const formatUsed = (bytes) => {
  if (!bytes) return '0 GB';
  const gb = bytes / GB;
  if (gb < 0.01) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${gb.toFixed(2)} GB`;
};

const MENU_ITEMS = [
  {
    id: 'myfiles',
    name: 'My Files',
    icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z',
  },
  {
    id: 'sharedfiles',
    name: 'Shared With Me',
    icon: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z',
  },
  {
    id: 'summary',
    name: 'AI Summary',
    icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z',
  },
  {
    id: 'links',
    name: 'Share Links',
    icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',
  },
];

const Sidebar = ({ activeView, setActiveView }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { userData, signOut } = useApp();
  const navigate = useNavigate();

  const usedBytes = userData?.storageUsed ?? 0;
  const maxGb = userData?.maxStorage ?? 0;
  const maxBytes = maxGb * GB;

  const usedPercent = maxBytes > 0 ? Math.min(100, (usedBytes / maxBytes) * 100) : 0;
  const nearlyFull = usedPercent >= 90;

  const handleSignOut = () => {
    signOut();
    toast.success('Signed out');
    navigate('/', { replace: true });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen((open) => !open)}
        type="button"
        aria-label="Toggle sidebar"
        aria-expanded={isOpen}
        className="fixed top-[4.5rem] left-3 z-50 text-gray-800 bg-white shadow-sm border border-gray-200 hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm p-2 focus:outline-none inline-flex sm:hidden"
      >
        <svg className="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M5 7h14M5 12h14M5 17h10" />
        </svg>
      </button>

      <aside
        id="default-sidebar"
        className={`fixed top-16 left-0 z-40 w-64 h-[calc(100vh-4rem)] transition-transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } sm:translate-x-0`}
        aria-label="Sidebar"
      >
        <div className="h-full px-3 py-4 overflow-y-auto bg-white/80 backdrop-blur-sm border-r border-gray-200/50 shadow-sm flex flex-col">
          <ul className="space-y-2 font-medium flex-1">
            {MENU_ITEMS.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    setActiveView(item.id);
                    setIsOpen(false);
                  }}
                  aria-current={activeView === item.id ? 'page' : undefined}
                  className={`w-full flex items-center px-3 py-2.5 rounded-xl transition-all ${
                    activeView === item.id
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100/50 hover:text-blue-600'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                  </svg>
                  <span className="ms-3">{item.name}</span>
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-auto pt-4 border-t border-gray-200/50">
            <div className="px-3 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-600">Storage Used</span>
                <span className="text-xs font-medium text-gray-500">
                  {formatUsed(usedBytes)} / {maxGb} GB
                </span>
              </div>
              <div
                className="w-full bg-gray-200 rounded-full h-2 overflow-hidden"
                role="progressbar"
                aria-valuenow={Math.round(usedPercent)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Storage used"
              >
                <div
                  className={`h-2 rounded-full transition-all ${
                    nearlyFull
                      ? 'bg-gradient-to-r from-orange-500 to-red-500'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600'
                  }`}
                  style={{ width: `${usedPercent}%` }}
                />
              </div>
              {nearlyFull && (
                <p className="text-xs text-red-600 mt-1.5">You are almost out of space.</p>
              )}
            </div>

            <button
              onClick={handleSignOut}
              className="w-full flex items-center px-3 py-2.5 text-gray-700 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100/50 hover:text-red-600 group transition-all"
            >
              <svg
                className="shrink-0 w-5 h-5 text-gray-600 group-hover:text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span className="flex-1 ms-3 whitespace-nowrap text-left">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 sm:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default Sidebar;
