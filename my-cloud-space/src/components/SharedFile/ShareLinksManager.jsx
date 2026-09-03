import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { getMyShareLinks, publicLinkUrl, revokeShareLink } from '../../service/shareLinkService';
import { toErrorMessage } from '../../service/apiClient';
import { formatDateTime, formatRelativeFuture } from '../../utils/format';
import ConfirmDialog from '../common/ConfirmDialog';

const ShareLinksManager = () => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingRevoke, setPendingRevoke] = useState(null);
  const [revoking, setRevoking] = useState(false);
  const [copiedToken, setCopiedToken] = useState(null);

  const loadLinks = useCallback(async () => {
    setLoading(true);
    try {
      setLinks(await getMyShareLinks());
    } catch (error) {
      toast.error(toErrorMessage(error, 'Could not load your share links.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLinks();
  }, [loadLinks]);

  const handleCopy = async (token) => {
    try {
      await navigator.clipboard.writeText(publicLinkUrl(token));
      setCopiedToken(token);
      toast.success('Link copied');
      setTimeout(() => setCopiedToken(null), 2000);
    } catch {
      toast.error('Could not copy the link.');
    }
  };

  const handleRevoke = async () => {
    setRevoking(true);
    try {
      await revokeShareLink(pendingRevoke.token);
      toast.success('Link revoked');
      setPendingRevoke(null);
      await loadLinks();
    } catch (error) {
      toast.error(toErrorMessage(error, 'Could not revoke that link.'));
    } finally {
      setRevoking(false);
    }
  };

  const statusOf = (link) => {
    if (link.revoked) return { label: 'Revoked', className: 'bg-gray-100 text-gray-600' };
    if (link.expired) return { label: 'Expired', className: 'bg-red-50 text-red-600' };
    if (link.downloadLimitReached) return { label: 'Limit reached', className: 'bg-amber-50 text-amber-700' };
    return { label: 'Active', className: 'bg-green-50 text-green-700' };
  };

  return (
    <>
      <div className="flex items-center justify-between ml-2 pb-5">
        <div>
          <h2 className="text-lg font-bold">Share Links</h2>
          <p className="text-xs text-gray-500 mt-0.5">Public links you have generated for your files.</p>
        </div>
        <button
          onClick={loadLinks}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <p className="text-gray-600 mt-2">Loading links...</p>
        </div>
      ) : links.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-600">You have not created any share links yet.</p>
          <p className="text-sm text-gray-500 mt-1">
            Use &ldquo;Share via link&rdquo; on any file in My Files.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {links.map((link) => {
            const status = statusOf(link);
            return (
              <div
                key={link.token}
                className="bg-white w-full p-4 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-gray-800 truncate">{link.fileName}</p>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.className}`}>
                        {status.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-gray-500">
                        Expires {formatDateTime(link.expiresAt)}
                        {link.usable && ` (${formatRelativeFuture(link.expiresAt)})`}
                      </span>
                      <span className="text-gray-300 text-xs">·</span>
                      <span className="text-xs text-gray-500">
                        {link.downloadCount} download{link.downloadCount === 1 ? '' : 's'}
                        {link.maxDownloads ? ` of ${link.maxDownloads}` : ''}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleCopy(link.token)}
                      disabled={!link.usable}
                      title={link.usable ? 'Copy link' : 'This link no longer works'}
                      className="px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {copiedToken === link.token ? 'Copied' : 'Copy'}
                    </button>
                    <button
                      onClick={() => setPendingRevoke(link)}
                      className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-all"
                    >
                      Revoke
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(pendingRevoke)}
        title="Revoke this link?"
        message={`Anyone holding the link to "${pendingRevoke?.fileName}" will no longer be able to download it. This cannot be undone.`}
        confirmLabel="Revoke"
        destructive
        busy={revoking}
        onConfirm={handleRevoke}
        onCancel={() => setPendingRevoke(null)}
      />
    </>
  );
};

export default ShareLinksManager;
