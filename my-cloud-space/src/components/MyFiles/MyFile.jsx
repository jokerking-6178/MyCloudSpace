import React, { useState } from 'react';

const MyFile = ({ id, name, date, size ,url}) => {
  const [openDropdown, setOpenDropdown] = useState(false);

  const toggleDropdown = () => {
    setOpenDropdown(!openDropdown);
  };

  return (
    <div className="relative bg-white w-full p-4 mb-4 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-between">
      {/* File Icon */}
      <div className="flex items-center gap-4 flex-1">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
          </svg>
        </div>
        
        {/* File Info */}
        <div className="flex-1">
          <h3 className="text-base font-semibold text-gray-800">{name}</h3>
          <div className="flex items-center gap-4 mt-1">
            <span className="text-sm text-gray-500">{date}</span>
            <span className="text-sm text-gray-400">•</span>
            <span className="text-sm text-gray-500">{size}</span>
          </div>
        </div>
      </div>

      {/* Dropdown Button */}
      <div className="relative">
        <button
          onClick={toggleDropdown}
          className="text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-lg p-2 transition-all"
          type="button"
        >
          <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeLinecap="round" strokeWidth="3" d="M6 12h.01m6 0h.01m5.99 0h.01"/>
          </svg>
        </button>

        {/* Dropdown Menu */}
        {openDropdown && (
          <>
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
              <ul className="py-2">
                <li>
                  <a
                    href="#"
                    className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100/50 transition-all"
                  >
                    <svg className="w-4 h-4 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
                    </svg>
                    Share File
                  </a>
                </li>
                <li>
                  <a
                    href={url}
                    className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100/50 transition-all"
                  >
                    <svg className="w-4 h-4 mr-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                    </svg>
                    Download
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100/50 transition-all"
                  >
                    <svg className="w-4 h-4 mr-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    File Info
                  </a>
                </li>
                
                <li className="border-t border-gray-100 mt-1 pt-1">
                  <a
                    href="#"
                    className="flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-all"
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                    Delete File
                  </a>
                </li>
              </ul>
            </div>
            {/* Click outside to close */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpenDropdown(false)}
            ></div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyFile;