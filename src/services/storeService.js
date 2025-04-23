import axios from 'axios';
import {API_URL} from './api';

export const createStore = async (data, accessToken) => {
  try {
    const response = await axios.post(
      `${API_URL}stores`,
      data,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating store:", error);
    throw error;
  }
};

export const getStores = async (accessToken) => {
  try {
    const response = await axios.get(`${API_URL}stores`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data?.data || [];
  } catch (error) {
    console.error('Error fetching stores:', error);
    throw error; // You can handle this error in the component
  }
};

export const assignStore = async (data, accessToken) => {
  try {
    const response = await axios.post(`${API_URL}stores/assign/`, data, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error assigning store:', error);
    throw error;
  }
};

export const updateStore = async (data, accessToken) => {
  try {
    const response = await axios.patch(`${API_URL}stores`, data, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating store:', error);
    throw error;
  }
};


export const deleteStore = async (storeId, accessToken) => {
  try {
    const response = await axios.delete(`${API_URL}stores/${storeId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting store:', error);
    throw error;
  }
};

export const deactivateInventory = async (data, accessToken) => {
  try {
    const response = await axios.post(`${API_URL}inventory/deactivate`, data, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json, text/plain, */*',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error deactivating inventory:', error);
    throw error;
  }
};
