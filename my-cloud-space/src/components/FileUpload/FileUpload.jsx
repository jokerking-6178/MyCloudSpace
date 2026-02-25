import React, { useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext';
import { uploadFile } from '../../service/fileService';

const FileUpload = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const {userData} = useContext(AppContext)

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      console.log('Selected file:', file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      console.log('Dropped file:', file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }

    try {
      const response = await uploadFile(selectedFile, userData.id, localStorage.getItem('token'));
      if(response.status == 200){
        toast.success('File uploaded successfully!');
      }else{
        toast.error("failed to upload file")
      }
      setSelectedFile(null);
      onClose();
    } catch (error) {
      toast.error('Failed to upload');
      console.error(error)
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gradient-to-br from-[#A3A1A6] via-[#DBCAAE] via-[#FDD597] to-[#F3AC94] z-50 transition-opacity"
        onClick={handleCancel}
      ></div>

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-200/50">
          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h3 className="text-xl font-semibold text-gray-800">
              Upload New File
            </h3>
            <button
              type="button"
              onClick={handleCancel}
              className="text-gray-500 bg-transparent hover:bg-gray-100 hover:text-gray-900 rounded-lg p-2 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          {/* Modal Body */}
          <div className="px-6 py-6">
            {/* File Upload Area */}
            <div className="flex items-center justify-center w-full">
              <label 
                htmlFor="dropzone-file" 
                className={`flex flex-col items-center justify-center w-full h-64 bg-gray-50 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                  isDragging 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:bg-gray-100'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center justify-center text-gray-600 pt-5 pb-6">
                  <svg className="w-12 h-12 mb-4 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h3a3 3 0 0 0 0-6h-.025a5.56 5.56 0 0 0 .025-.5A5.5 5.5 0 0 0 7.207 9.021C7.137 9.017 7.071 9 7 9a4 4 0 1 0 0 8h2.167M12 19v-9m0 0-2 2m2-2 2 2"/>
                  </svg>
                  
                  {selectedFile ? (
                    <div className="text-center">
                      <p className="mb-2 text-sm font-semibold text-green-600">
                        ✓ File Selected
                      </p>
                      <p className="text-xs text-gray-500">{selectedFile.name}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="mb-2 text-sm">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        SVG, PNG, JPG, GIF, PDF, DOC, XLS (MAX. 50MB)
                      </p>
                    </>
                  )}
                </div>
                <input 
                  id="dropzone-file" 
                  type="file" 
                  className="hidden" 
                  onChange={handleFileChange}
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                />
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 px-5 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium text-sm transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpload}
                disabled={!selectedFile}
                className={`flex-1 px-5 py-3 rounded-xl font-medium text-sm transition-all ${
                  selectedFile
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Upload File
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FileUpload;