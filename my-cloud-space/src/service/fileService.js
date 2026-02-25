import axios from "axios";
import toast from 'react-hot-toast';

const API_URL = "http://localhost:8081/api/files"

export const uploadFile = async (file, userId, token) => {
  const formData = new FormData();
  
  formData.append('file', file);
  formData.append('uploadedBy', userId);

  try {
    const response = await axios.post(
      API_URL + '/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    return response;
  } catch (error) {
    if (error.response) {
      // Server responded with error
      console.error('Server error:', error.response.data);
      throw new Error(error.response.data.message || 'Upload failed');
    } else {
      // Network error
      console.error('Network error:', error.message);
      throw error;
    }
  }
};

export const getFiles = async (userId, token) => {
  try {
    const response =await axios.get(API_URL + '/user/'+userId , {headers: {Authorization: `Bearer ${localStorage.getItem('token')}`}})
    return response
  } catch (error) {
    if (error.response) {
      // Server responded with error
      console.error('Server error:', error.response.data);
      throw new Error(error.response.data.message || 'fetch failed');
    } else {
      // Network error
      console.error('Network error:', error.message);
      throw error;
    }
  }
}

export const getSharedFiles = async (userId, token) => {
  try {
    const response =await axios.get(API_URL + '/shared/'+userId , {headers: {Authorization: `Bearer ${localStorage.getItem('token')}`}})
    return response
  } catch (error) {
    if (error.response) {
      // Server responded with error
      console.error('Server error:', error.response.data);
      throw new Error(error.response.data.message || 'fetch failed');
    } else {
      // Network error
      console.error('Network error:', error.message);
      throw error;
    }
  }
}


export const deleteFile = async (fileId, userId, token) => {
  try{
    const response = await axios.delete(API_URL+'/remove/'+fileId+'/'+userId , {headers : {Authorization : `Bearer ${localStorage.getItem('token')}`}})
    return response
  }catch(error){
    if (error.response) {
      // Server responded with error
      console.error('Server error:', error.response.data);
      throw new Error(error.response.data.message || 'failed to delete');
    } else {
      // Network error
      console.error('Network error:', error.message);
      throw error;
    }
  }
}

export const ShareFile = (fileId, userId, SharedWithId, token) => {

}

