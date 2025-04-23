import api from "./api";


export const uploadToMediaLibrary = async (file, location, fileName) => {
  try {
    const formData = new FormData();
    formData.append('location', location);
    formData.append('fileName', fileName);
    formData.append('file', file);

    const response = await api.post(`/mediaLibrary`, formData);
    return response.data;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};
