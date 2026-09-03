import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import MyFile from '../../components/MyFiles/MyFile';
import Sidebar from '../../components/Sidebar/Sidebar';
import Navbar from '../../components/Navbar/Navbar';
import SharedFile from '../../components/SharedFile/SharedFile';
import ShareLinksManager from '../../components/SharedFile/ShareLinksManager';
import Summary from '../../components/Summary/Summary';
import FileUpload from '../../components/FileUpload/FileUpload';
import { getFiles } from '../../service/fileService';
import { toErrorMessage } from '../../service/apiClient';
import { useApp } from '../../hooks/useApp';

function Dashboard() {
  const [activeView, setActiveView] = useState('myfiles');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const { refreshUser } = useApp();

  const fetchFiles = useCallback(async (query) => {
    setLoading(true);
    try {
      setFiles(await getFiles(query));
    } catch (error) {
      toast.error(toErrorMessage(error, 'Could not load your files.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeView !== 'myfiles') return undefined;

    const timer = setTimeout(() => fetchFiles(searchQuery), searchQuery ? 300 : 0);
    return () => clearTimeout(timer);
  }, [activeView, searchQuery, fetchFiles]);

  const handleMutation = useCallback(async () => {
    await fetchFiles(searchQuery);
    refreshUser();
  }, [fetchFiles, searchQuery, refreshUser]);

  const handleUploadSuccess = useCallback(async () => {
    setShowUploadModal(false);
    await handleMutation();
  }, [handleMutation]);

  const renderMyFiles = () => (
    <>
      <div className="flex items-center justify-between ml-2 pb-5">
        <div>
          <h2 className="text-lg font-bold">My Files</h2>
          {searchQuery && !loading && (
            <p className="text-xs text-gray-500 mt-0.5">
              {files.length} result{files.length === 1 ? '' : 's'} for &ldquo;{searchQuery}&rdquo;
            </p>
          )}
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all"
        >
          + Upload New File
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <p className="text-gray-600 mt-2">Loading files...</p>
        </div>
      ) : files.length > 0 ? (
        files.map((file) => (
          <MyFile
            key={file.id}
            id={file.id}
            name={file.fileName}
            date={file.uploadedAt}
            size={file.fileSizeFormatted}
            onMutated={handleMutation}
          />
        ))
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-600">
            {searchQuery ? 'No files match that search.' : 'No files yet — upload your first one.'}
          </p>
        </div>
      )}
    </>
  );

  const renderContent = () => {
    switch (activeView) {
      case 'myfiles':
        return renderMyFiles();
      case 'sharedfiles':
        return <SharedFile />;
      case 'summary':
        return <Summary />;
      case 'links':
        return <ShareLinksManager />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={(value) => {
          setSearchQuery(value);
          setActiveView('myfiles');
        }}
        onUploadClick={() => setShowUploadModal(true)}
      />

      <div className="flex pt-16">
        <Sidebar activeView={activeView} setActiveView={setActiveView} />
        <div className="flex-1 sm:ml-64 p-6">{renderContent()}</div>
      </div>

      <FileUpload
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
}

export default Dashboard;
