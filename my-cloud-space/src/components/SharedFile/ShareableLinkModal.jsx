import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { createShareLink, publicLinkUrl } from '../../service/shareLinkService';
import { toErrorMessage } from '../../service/apiClient';
import { formatDateTime } from '../../utils/format';

const EXPIRY_OPTIONS = [
  { label: '1 hour', seconds: 3600 },
  { label: '6 hours', seconds: 21600 },
  { label: '24 hours', seconds: 86400 },
  { label: '3 days', seconds: 259200 },
  { label: '7 days', seconds: 604800 },
  { label: '30 days', seconds: 2592000 },
];

const ShareableLinkModal = ({ isOpen, onClose, file }) => {
  const [expirySeconds, setExpirySeconds] = useState(86400);
  const [limitDownloads, setLimitDownloads] = useState(false);
  const [maxDownloads, setMaxDownloads] = useState(5);
  const [creating, setCreating] = useState(false);
  const [link, setLink] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape' && !creating) handleClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, creating]);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const created = await createShareLink(file.id, {
        expirySeconds,
        maxDownloads: limitDownloads ? maxDownloads : null,
      });
      setLink(created);
      toast.success('Share link created');
    } catch (error) {
      toast.error(toErrorMessage(error, 'Could not create a share link.'));
    } finally {
      setCreating(false);
    }
  };

  const shareUrl = link ? publicLinkUrl(link.token) : '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy. Select the link and copy it manually.');
    }
  };

  const handleClose = () => {
    setLink(null);
    setCopied(false);
    setLimitDownloads(false);
    setMaxDownloads(5);
    setExpirySeconds(86400);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Create a share link"
        className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-gray-800">Share via link</h3>
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
          {link ? (
            <>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Anyone with this link can download the file</p>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={shareUrl}
                    onFocus={(event) => event.target.select()}
                    aria-label="Share link"
                    className="flex-1 px-3 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-mono"
                  />
                  <button
                    onClick={handleCopy}
                    className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-all"
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              <dl className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <dt className="text-gray-500">Expires</dt>
                  <dd className="text-gray-800 font-medium">{formatDateTime(link.expiresAt)}</dd>
                </div>
                <div className="flex justify-between text-xs">
                  <dt className="text-gray-500">Download limit</dt>
                  <dd className="text-gray-800 font-medium">{link.maxDownloads ?? 'Unlimited'}</dd>
                </div>
              </dl>

              <p className="text-xs text-gray-400">
                You can revoke this link at any time from <span className="font-medium">Share Links</span>.
              </p>

              <button
                onClick={handleClose}
                className="w-full py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm transition-all"
              >
                Done
              </button>
            </>
          ) : (
            <>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Link expires after</p>
                <div className="grid grid-cols-3 gap-2">
                  {EXPIRY_OPTIONS.map((option) => (
                    <button
                      key={option.seconds}
                      onClick={() => setExpirySeconds(option.seconds)}
                      className={`py-2 text-xs font-medium rounded-xl border transition-all ${
                        expirySeconds === option.seconds
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-purple-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={limitDownloads}
                    onChange={(event) => setLimitDownloads(event.target.checked)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Limit the number of downloads</span>
                </label>

                {limitDownloads && (
                  <div className="mt-3 flex items-center gap-2">
                    <label htmlFor="max-downloads" className="text-xs text-gray-500">
                      Maximum
                    </label>
                    <input
                      id="max-downloads"
                      type="number"
                      min={1}
                      max={1000}
                      value={maxDownloads}
                      onChange={(event) => {
                        const next = event.target.value;
                        setMaxDownloads(next === '' ? '' : Number(next));
                      }}
                      onBlur={() => {
                        const numeric = Number(maxDownloads);
                        if (!Number.isFinite(numeric) || numeric < 1) setMaxDownloads(1);
                        else if (numeric > 1000) setMaxDownloads(1000);
                      }}
                      className="w-24 px-3 py-1.5 text-sm text-center bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-100 focus:border-purple-400 focus:outline-none"
                    />
                    <span className="text-xs text-gray-500">downloads</span>
                  </div>
                )}
              </div>

              <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                <p className="text-xs text-amber-700 leading-relaxed">
                  Anyone with the link can download this file without signing in. Only share it with people you
                  trust.
                </p>
              </div>

              <button
                onClick={handleCreate}
                disabled={creating}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {creating ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Generate link'
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareableLinkModal;
