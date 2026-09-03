import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { getFiles } from '../../service/fileService';
import { toErrorMessage } from '../../service/apiClient';

const FilePicker = ({ onFileSelect, selectedFile, ingestedFiles, isIngesting }) => {
  const [files, setFiles] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      setFiles(await getFiles());
    } catch (error) {
      toast.error(toErrorMessage(error, 'Could not load your files.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) fetchFiles();
  }, [isOpen, fetchFiles]);

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    if (['pdf'].includes(ext)) return '📄';
    if (['doc', 'docx'].includes(ext)) return '📝';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return '🖼️';
    if (['xls', 'xlsx'].includes(ext)) return '📊';
    if (['txt'].includes(ext)) return '📃';
    return '📎';
  };

  const filteredFiles = files.filter(file =>
    file.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isIngesting}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-blue-300 transition-all disabled:opacity-50"
      >
        {isIngesting ? (
          <>
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            Ingesting...
          </>
        ) : selectedFile ? (
          <>
            <span>{getFileIcon(selectedFile.fileName)}</span>
            <span className="max-w-[150px] truncate">{selectedFile.fileName}</span>
            {ingestedFiles.has(selectedFile.id) && (
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            )}
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
            </svg>
            Select File
          </>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute left-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-96 overflow-hidden flex flex-col">
            <div className="p-3 border-b border-gray-200">
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
              />
            </div>
            <div className="overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-500 text-sm">Loading files...</div>
              ) : filteredFiles.length > 0 ? (
                filteredFiles.map((file) => (
                  <button
                    key={file.id}
                    onClick={() => {
                      onFileSelect(file);
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-all text-left border-b border-gray-100 last:border-b-0"
                  >
                    <span className="text-2xl">{getFileIcon(file.fileName)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{file.fileName}</p>
                      <p className="text-xs text-gray-500">{file.fileSizeFormatted}</p>
                    </div>
                    {ingestedFiles.has(file.id) && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-lg font-medium">
                        Ready
                      </span>
                    )}
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500 text-sm">
                  {searchQuery ? 'No files match that search' : 'No files yet — upload one first'}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FilePicker;