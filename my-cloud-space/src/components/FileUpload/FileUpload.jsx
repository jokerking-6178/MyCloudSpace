import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { uploadFile } from '../../service/fileService';
import { toErrorMessage } from '../../service/apiClient';
import { formatBytes } from '../../utils/format';

const MAX_UPLOAD_BYTES = 100 * 1024 * 1024;
const MAX_UPLOAD_LABEL = '100 MB';

const FileUpload = ({ isOpen, onClose, onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape' && !uploading) handleCancel();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, uploading]);

  const acceptFile = (file) => {
    if (!file) return;
    if (file.size === 0) {
      setError('That file is empty.');
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setError(`That file is ${formatBytes(file.size)}. The limit is ${MAX_UPLOAD_LABEL}.`);
      return;
    }
    setError('');
    setSelectedFile(file);
  };

  const handleFileChange = (event) => acceptFile(event.target.files?.[0]);

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    acceptFile(event.dataTransfer.files?.[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Choose a file first.');
      return;
    }

    setUploading(true);
    setProgress(0);
    setError('');
    try {
      await uploadFile(selectedFile, { onProgress: setProgress });
      toast.success('File uploaded successfully');
      setSelectedFile(null);
      setProgress(0);
      onUploadSuccess?.();
    } catch (uploadError) {
      const message = toErrorMessage(uploadError, 'Upload failed.');
      setError(message);
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    if (uploading) return;
    setSelectedFile(null);
    setProgress(0);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={handleCancel} aria-hidden="true" />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Upload a file"
          className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-200/50"
        >
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h3 className="text-xl font-semibold text-gray-800">Upload New File</h3>
            <button
              type="button"
              onClick={handleCancel}
              disabled={uploading}
              aria-label="Close"
              className="text-gray-500 bg-transparent hover:bg-gray-100 hover:text-gray-900 rounded-lg p-2 transition-all disabled:opacity-40"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="px-6 py-6">
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="dropzone-file"
                className={`flex flex-col items-center justify-center w-full h-64 bg-gray-50 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                  isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:bg-gray-100'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center justify-center text-gray-600 pt-5 pb-6 px-4">
                  <svg className="w-12 h-12 mb-4 text-gray-400" fill="none" viewBox="0 0 24 24">
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 17h3a3 3 0 0 0 0-6h-.025a5.56 5.56 0 0 0 .025-.5A5.5 5.5 0 0 0 7.207 9.021C7.137 9.017 7.071 9 7 9a4 4 0 1 0 0 8h2.167M12 19v-9m0 0-2 2m2-2 2 2"
                    />
                  </svg>

                  {selectedFile ? (
                    <div className="text-center">
                      <p className="mb-2 text-sm font-semibold text-green-600">File selected</p>
                      <p className="text-xs text-gray-500 break-all">{selectedFile.name}</p>
                      <p className="text-xs text-gray-400 mt-1">{formatBytes(selectedFile.size)}</p>
                    </div>
                  ) : (
                    <>
                      <p className="mb-2 text-sm">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">Any file type, up to {MAX_UPLOAD_LABEL}</p>
                    </>
                  )}
                </div>
                <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} />
              </label>
            </div>

            {error && (
              <p className="mt-4 text-sm text-red-600" role="alert">
                {error}
              </p>
            )}

            {uploading && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-gray-600">Uploading...</span>
                  <span className="text-xs font-medium text-gray-500">{progress}%</span>
                </div>
                <div
                  className="w-full bg-gray-200 rounded-full h-2 overflow-hidden"
                  role="progressbar"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={handleCancel}
                disabled={uploading}
                className="flex-1 px-5 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium text-sm transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className={`flex-1 px-5 py-3 rounded-xl font-medium text-sm transition-all ${
                  selectedFile && !uploading
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {uploading ? 'Uploading...' : 'Upload File'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FileUpload;
