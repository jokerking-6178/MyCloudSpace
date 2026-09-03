import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { getSharedFiles, downloadFile } from '../../service/fileService';
import { toErrorMessage } from '../../service/apiClient';
import { formatDate } from '../../utils/format';

const SharedFile = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      setFiles(await getSharedFiles());
    } catch (error) {
      toast.error(toErrorMessage(error, 'Could not load shared files.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleDownload = async (file) => {
    setDownloading(file.id);
    try {
      await downloadFile(file.id, file.fileName);
      toast.success('Download started');
    } catch (error) {
      toast.error(toErrorMessage(error, 'Download failed.'));
    } finally {
      setDownloading(null);
    }
  };

  return (
    <>
      <div className="text-lg font-bold ml-2 pb-5">Shared With Me</div>

      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <p className="text-gray-600 mt-2">Loading shared files...</p>
        </div>
      ) : files.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-600">Nobody has shared a file with you yet.</p>
        </div>
      ) : (
        files.map((file) => (
          <div
            key={file.id}
            className="relative bg-white w-full p-4 mb-3 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{file.fileName}</p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-xs text-gray-500">Shared by {file.uploadedByEmail}</span>
                  <span className="text-gray-300 text-xs">·</span>
                  <span className="text-xs text-gray-500">{formatDate(file.uploadedAt)}</span>
                  {file.fileSizeFormatted && (
                    <>
                      <span className="text-gray-300 text-xs">·</span>
                      <span className="text-xs text-gray-500">{file.fileSizeFormatted}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => handleDownload(file)}
              disabled={downloading === file.id}
              className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              {downloading === file.id ? 'Downloading...' : 'Download'}
            </button>
          </div>
        ))
      )}
    </>
  );
};

export default SharedFile;
