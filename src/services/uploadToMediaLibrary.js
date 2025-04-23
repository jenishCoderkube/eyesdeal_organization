import axios from 'axios';
import { API_URL } from './api';

export const uploadToMediaLibrary = async (file, location, fileName, accessToken) => {
  try {
    const formData = new FormData();
    formData.append('location', location);
    formData.append('fileName', fileName);
    formData.append('file', file);

    const response = await axios.post(`${API_URL}mediaLibrary`, formData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};
