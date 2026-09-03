import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { getFileShares, shareFile, unshareFile } from '../../service/fileService';
import { toErrorMessage } from '../../service/apiClient';
import { useApp } from '../../hooks/useApp';

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const ShareFileModal = ({ isOpen, onClose, file }) => {
  const { userData } = useApp();
  const [email, setEmail] = useState('');
  const [sharing, setSharing] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [recipients, setRecipients] = useState([]);
  const [loadingRecipients, setLoadingRecipients] = useState(false);
  const [removing, setRemoving] = useState(null);

  const loadRecipients = useCallback(async () => {
    if (!file?.id) return;
    setLoadingRecipients(true);
    try {
      setRecipients(await getFileShares(file.id));
    } catch {
      setRecipients([]);
    } finally {
      setLoadingRecipients(false);
    }
  }, [file?.id]);

  useEffect(() => {
    if (isOpen) loadRecipients();
  }, [isOpen, loadRecipients]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  const handleShare = async () => {
    const target = email.trim().toLowerCase();

    if (!isValidEmail(target)) {
      setEmailError('Enter a valid email address.');
      return;
    }
    if (target === userData?.email?.toLowerCase()) {
      setEmailError('That file already belongs to you.');
      return;
    }

    setEmailError('');
    setSharing(true);
    try {
      await shareFile(file.id, target);
      toast.success(`Shared with ${target}`);
      setEmail('');
      await loadRecipients();
    } catch (error) {
      const message = toErrorMessage(error, 'Could not share that file.');
      if (message.toLowerCase().includes('no account')) {
        setEmailError(message);
      } else {
        toast.error(message);
      }
    } finally {
      setSharing(false);
    }
  };

  const handleRemove = async (recipientEmail) => {
    setRemoving(recipientEmail);
    try {
      await unshareFile(file.id, recipientEmail);
      toast.success(`Access removed for ${recipientEmail}`);
      await loadRecipients();
    } catch (error) {
      toast.error(toErrorMessage(error, 'Could not remove access.'));
    } finally {
      setRemoving(null);
    }
  };

  const handleClose = () => {
    setEmail('');
    setEmailError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Share file"
        className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-gray-800">Share file</h3>
              <p className="text-xs text-gray-400 mt-0.5 truncate">{file?.fileName}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            aria-label="Close"
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div>
            <label htmlFor="share-email" className="block text-sm font-medium text-gray-700 mb-1.5">
              Recipient email
            </label>
            <div className="flex gap-2">
              <input
                id="share-email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setEmailError('');
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !sharing && email.trim()) handleShare();
                }}
                placeholder="colleague@example.com"
                className={`flex-1 px-4 py-2.5 text-sm border rounded-xl focus:ring-2 focus:outline-none transition-all ${
                  emailError
                    ? 'border-red-300 bg-red-50 focus:ring-red-100'
                    : 'border-gray-200 bg-gray-50 focus:ring-blue-100 focus:border-blue-400 focus:bg-white'
                }`}
              />
              <button
                onClick={handleShare}
                disabled={sharing || !email.trim()}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sharing ? 'Sharing...' : 'Share'}
              </button>
            </div>
            {emailError && (
              <p className="text-xs text-red-500 mt-1.5" role="alert">
                {emailError}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-1.5">The recipient must already have a MyCloudSpace account.</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">People with access</p>

            {loadingRecipients ? (
              <p className="text-xs text-gray-400 py-2">Loading...</p>
            ) : recipients.length === 0 ? (
              <p className="text-xs text-gray-400 py-2">Only you have access to this file.</p>
            ) : (
              <ul className="space-y-2 max-h-44 overflow-y-auto">
                {recipients.map((recipient) => (
                  <li
                    key={recipient}
                    className="flex items-center justify-between gap-3 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2"
                  >
                    <span className="text-sm text-gray-700 truncate">{recipient}</span>
                    <button
                      onClick={() => handleRemove(recipient)}
                      disabled={removing === recipient}
                      className="text-xs font-medium text-red-600 hover:text-red-700 hover:underline disabled:opacity-50 flex-shrink-0"
                    >
                      {removing === recipient ? 'Removing...' : 'Remove'}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
            <p className="text-xs text-blue-700 leading-relaxed">
              The file appears in their &ldquo;Shared With Me&rdquo; section immediately and stays there until you
              remove access. For time-limited access, generate a share link instead.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareFileModal;
