import React, { useContext, useEffect, useState } from 'react';
import MyFile from '../../components/MyFiles/MyFile';;
import Sidebar from '../../components/Sidebar/Sidebar';
import Navbar from '../../components/Navbar/Navbar';
import SharedFile from '../../components/SharedFile/SharedFile';
import Summary from '../../components/Summary/Summary';
import { getFiles, getSharedFiles } from '../../service/fileService';
import { AppContext } from '../../components/context/AppContext';
import { toast } from 'react-toastify';

function Dashboard() {
  const [activeView, setActiveView] = useState('myfiles');
  const [hasFetchedFiles, setHasFetchedFiles] = useState(false)
  const [hasFetchedSharedFiles, setHasFetchedSharedFiles] = useState(false)
  const [files, setFiles] = useState([]);
  const [sharedFiles, setSharedFiles] = useState([]) // Changed from const to useState
  const [loading, setLoading] = useState(false);
  const { userData } = useContext(AppContext);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await getFiles(userData.id, localStorage.getItem('token'));
      
      if (response.status === 200) {
        setFiles(response.data);
        setHasFetchedFiles(true) // Use setFiles instead of reassigning
        toast.success('Files fetched successfully');
      } else {
        toast.error('Error fetching files');
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      toast.error('Failed to fetch files');
    } finally {
      setLoading(false);
    }
  };

  const fetchShareFiles = async () => {
    try {
      setLoading(true);
      const response = await getSharedFiles(userData.id, localStorage.getItem('token'));
      
      if (response.status === 200) {
        setSharedFiles(response.data);
        setHasFetchedSharedFiles(true) // Use setFiles instead of reassigning
        toast.success('Shared Files fetched successfully');
      } else {
        toast.error('Error fetching shared files');
      }
    } catch (error) {
      console.error('Error fetching shared files:', error);
      toast.error('Failed to fetch shared files');
    } finally {
      setLoading(false);
    }
  };

  // Fetch files when component mounts or when switching to myfiles view
  useEffect(() => {
    if (activeView === 'myfiles' && userData?.id && !hasFetchedFiles) {
      fetchFiles();
    }
    if(activeView === 'sharedfiles' && userData?.id && !hasFetchedSharedFiles){
      fetchShareFiles();
    }
  }, [activeView, userData?.id, hasFetchedFiles, hasFetchedSharedFiles]);

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <div className="text-center py-20">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Dashboard Overview</h2>
            <p className="text-gray-600">Welcome to your dashboard</p>
          </div>
        );
      case 'myfiles':
        return (
          <>
            <div className="text-lg font-bold ml-2 pb-5">My Files</div>
            {loading ? (
              <div className="text-center py-10">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
                  url={file.downloadUrl}
                />
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-600">No files found</p>
              </div>
            )}
          </>
        );
      case 'sharedfiles':
        return (
          <>
            <div className="text-lg font-bold ml-2 pb-5">Shared Files</div>
            {loading ? (
              <div className="text-center py-10">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-gray-600 mt-2">Loading files...</p>
              </div>
            ) : sharedFiles.length > 0 ? (
              sharedFiles.map((file) => (
                <SharedFile
                  key={file.id}
                  id={file.id}
                  name={file.fileName}
                  date={file.uploadedAt}
                  size={file.fileSizeFormatted}
                  url={file.downloadUrl}
                  owner={file.uploadedByEmail}
                />
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-600">No files found</p>
              </div>
            )}
          </>
        );
      case 'summary':
        return <Summary />;
      case 'users':
        return (
          <div className="text-center py-20">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Users Management</h2>
            <p className="text-gray-600">Manage your team members</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Navbar />

      {/* Main Content with Sidebar */}
      <div className="flex pt-16">
        <Sidebar activeView={activeView} setActiveView={setActiveView} />

        {/* Main content area */}
        <div className="flex-1 sm:ml-64 p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;