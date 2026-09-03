import { useState } from 'react';
import { toast } from 'react-toastify';
import { deleteFile, downloadFile } from '../../service/fileService';
import { toErrorMessage } from '../../service/apiClient';
import ShareFileModal from '../SharedFile/ShareFileModal';
import ShareableLinkModal from '../SharedFile/ShareableLinkModal';
import ConfirmDialog from '../common/ConfirmDialog';
import { formatDate } from '../../utils/format';

const MyFile = ({ id, name, date, size, onMutated }) => {
  const [openDropdown, setOpenDropdown] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDownload = async () => {
    setOpenDropdown(false);
    setDownloading(true);
    try {
      await downloadFile(id, name);
      toast.success('Download started');
    } catch (error) {
      toast.error(toErrorMessage(error, 'Download failed.'));
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteFile(id);
      toast.success('File deleted');
      setConfirmDelete(false);
      onMutated?.();
    } catch (error) {
      toast.error(toErrorMessage(error, 'Delete failed.'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="relative bg-white w-full p-4 mb-3 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-gray-500">{formatDate(date)}</span>
              {size && (
                <>
                  <span className="text-gray-300 text-xs">·</span>
                  <span className="text-xs text-gray-500">{size}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setOpenDropdown((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={openDropdown}
            aria-label={`Actions for ${name}`}
            className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg p-2 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeWidth="2.5" d="M6 12h.01m6 0h.01m5.99 0h.01" />
            </svg>
          </button>

          {openDropdown && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setOpenDropdown(false)} aria-hidden="true" />
              <div role="menu" className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                <div className="px-3 pt-2 pb-1">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Share</p>
                </div>

                <button
                  role="menuitem"
                  onClick={() => {
                    setOpenDropdown(false);
                    setShowShareModal(true);
                  }}
                  className="flex items-center w-full px-3 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all gap-3"
                >
                  <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">Share with user</p>
                    <p className="text-xs text-gray-400">By email address</p>
                  </div>
                </button>

                <button
                  role="menuitem"
                  onClick={() => {
                    setOpenDropdown(false);
                    setShowLinkModal(true);
                  }}
                  className="flex items-center w-full px-3 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-all gap-3"
                >
                  <div className="w-7 h-7 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-3.5 h-3.5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                      />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">Share via link</p>
                    <p className="text-xs text-gray-400">Generate expiring link</p>
                  </div>
                </button>

                <div className="border-t border-gray-100 mx-3 my-1" />

                <div className="px-3 pt-1 pb-1">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Actions</p>
                </div>

                <button
                  role="menuitem"
                  onClick={handleDownload}
                  disabled={downloading}
                  className="flex items-center w-full px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-all gap-3 disabled:opacity-50"
                >
                  <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                  </div>
                  <p className="text-sm font-medium">{downloading ? 'Downloading...' : 'Download'}</p>
                </button>

                <button
                  role="menuitem"
                  onClick={() => {
                    setOpenDropdown(false);
                    setConfirmDelete(true);
                  }}
                  className="flex items-center w-full px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-all gap-3 mb-1"
                >
                  <div className="w-7 h-7 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </div>
                  <p className="text-sm font-medium">Delete file</p>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDelete}
        title="Delete this file?"
        message={`"${name}" will be permanently deleted, along with any share links pointing at it. This cannot be undone.`}
        confirmLabel="Delete"
        destructive
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />

      <ShareFileModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} file={{ id, fileName: name }} />

      <ShareableLinkModal
        isOpen={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        file={{ id, fileName: name }}
      />
    </>
  );
};

export default MyFile;
