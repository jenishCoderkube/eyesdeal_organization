import api from './api'; // Axios instance

export const uploadBulkProducts = async (file, type) => {
  try {
    const formData = new FormData();
    formData.append('type', type);
    formData.append('bulkUploadFile', file);

    const response = await api.post(
      '/products/upload/bulk-upload-3',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error('Error uploading bulk product file:', error);
    throw error;
  }
};

export const getProductsRange = async (type) => {
  try {
    const response = await api.get(`/products/${type}?limit=1`);
    return response.data;
  } catch (error) {
    console.error('Error fetching dynamic products:', error);
    throw error;
  }
};
