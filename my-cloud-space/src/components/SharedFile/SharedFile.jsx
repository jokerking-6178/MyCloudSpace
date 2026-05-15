import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'react-hot-toast';
import { getSharedFiles, downloadFile } from '../../service/fileService';
import { AppContext } from '../context/AppContext';

const SharedFile = () => {
  const [files, setFiles]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);
  const { userData }          = useContext(AppContext);

  useEffect(() => {
    if (userData?.id) fetchFiles();
  }, [userData?.id]);

  const fetchFiles = async () => {
    try {
      const res = await getSharedFiles(userData.id);
      setFiles(res.data);
    } catch (err) {
      toast.error(err.message || 'Failed to load shared files');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (file) => {
    setDownloading(file.id);
    try {
      const res = await downloadFile(file.id);
      const url  = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href  = url;
      link.setAttribute('download', file.fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Download started');
    } catch (err) {
      toast.error(err.message || 'Download failed');
    } finally {
      setDownloading(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const formatSize = (bytes) => {
    if (!bytes && bytes !== 0) return '';
    if (bytes < 1024)        return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return 'text-gray-500 bg-gray-100';
    const ext = fileName.split('.').pop().toLowerCase();
    if (['pdf'].includes(ext))              return 'text-red-500 bg-red-50';
    if (['doc', 'docx'].includes(ext))      return 'text-blue-500 bg-blue-50';
    if (['xls', 'xlsx'].includes(ext))      return 'text-green-500 bg-green-50';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return 'text-purple-500 bg-purple-50';
    if (['zip', 'rar'].includes(ext))       return 'text-orange-500 bg-orange-50';
    return 'text-gray-500 bg-gray-100';
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"/>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Shared with me</h2>
        <span className="text-sm text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
          {files.length} file{files.length !== 1 ? 's' : ''}
        </span>
      </div>

      {files.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
            </svg>
          </div>
          <p className="text-gray-600 font-medium">No files shared with you yet</p>
          <p className="text-sm text-gray-400 mt-1">
            When someone shares a file with your email, it appears here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {files.map((file) => (
            <div
              key={file.id}
              className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getFileIcon(file.fileName)}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{file.fileName}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-xs text-gray-500">{formatDate(file.uploadedAt)}</span>
                    {file.fileSize != null && (
                      <>
                        <span className="text-gray-300 text-xs">·</span>
                        <span className="text-xs text-gray-500">{formatSize(file.fileSize)}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleDownload(file)}
                disabled={downloading === file.id}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium rounded-lg transition-all disabled:opacity-50 ml-4 flex-shrink-0"
              >
                {downloading === file.id ? (
                  <div className="w-3.5 h-3.5 border-2 border-blue-700 border-t-transparent rounded-full animate-spin"/>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                  </svg>
                )}
                {downloading === file.id ? 'Downloading...' : 'Download'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SharedFile;