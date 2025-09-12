import api from "./api";

// Auth endpoints
const STORE_ENDPOINTS = {
  STORES: `/stores`,
  STOREASSIGN: `/stores/assign`,
  DELETESTORE: (params) => `/stores/${params}`,
  DEACTIVATEINVENTORY: `/inventory/deactivate`,
  PRODUCTS: `/products/product`,
  INVENTORY_GENERAL: `/inventory/get-inventory-general`,
  STOCK_SALE: `/stockSale`,
};

export const storeService = {
  getStores: async () => {
    try {
      const response = await api.get(STORE_ENDPOINTS.STORES);
      return response.data.data || [];
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error checking store",
      };
    }
  },
  createStore: async (data) => {
    try {
      const response = await api.post(STORE_ENDPOINTS.STORES, data);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error checking store",
      };
    }
  },
  assignStore: async (data) => {
    try {
      const response = await api.post(STORE_ENDPOINTS.STOREASSIGN, data);
      return response;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error checking store",
      };
    }
  },
  updateStore: async (data) => {
    try {
      const response = await api.patch(STORE_ENDPOINTS.STORES, data);
      return response;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error checking store",
      };
    }
  },
  deleteStore: async (storeId) => {
    try {
      const response = await api.delete(STORE_ENDPOINTS.DELETESTORE(storeId));
      return response;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error checking store",
      };
    }
  },
  deactivateInventory: async (data) => {
    try {
      const response = await api.post(
        STORE_ENDPOINTS.DEACTIVATEINVENTORY,
        data
      );
      return response;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error checking store",
      };
    }
  },
  searchProducts: async (searchQuery) => {
    try {
      const response = await api.get(STORE_ENDPOINTS.PRODUCTS, {
        params: { search: searchQuery },
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error searching products",
      };
    }
  },
  searchProductsExcludingLenses: async (searchQuery) => {
    try {
      const response = await api.get(STORE_ENDPOINTS.PRODUCTS, {
        params: {
          search: searchQuery,
          "__t[$nin][0]": "spectacleLens",
          "__t[$nin][1]": "contactLens",
        },
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error searching products",
      };
    }
  },
  getInventoryGeneral: async (params) => {
    try {
      const response = await api.get(STORE_ENDPOINTS.INVENTORY_GENERAL, {
        params: params,
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error fetching inventory",
      };
    }
  },
  createStockSale: async (data) => {
    try {
      const response = await api.post(STORE_ENDPOINTS.STOCK_SALE, data);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Error creating stock sale transaction",
        error: error.response?.data?.error || "Unknown error",
      };
    }
  },
};
// export const createStore = async (data, accessToken) => {
//   try {
//     const response = await axios.post(
//       `${API_URL}stores`,
//       data,
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//           'Content-Type': 'application/json',
//         },
//       }
//     );
//     return response.data;
//   } catch (error) {
//     console.error("Error creating store:", error);
//     throw error;
//   }
// };

// export const getStores = async (accessToken) => {
//   try {
//     const response = await axios.get(`${API_URL}stores`, {
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//       },
//     });
//     return response.data?.data || [];
//   } catch (error) {
//     console.error('Error fetching stores:', error);
//     throw error; // You can handle this error in the component
//   }
// };

// export const assignStore = async (data, accessToken) => {
//   try {
//     const response = await axios.post(`${API_URL}stores/assign/`, data, {
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//         'Content-Type': 'application/json',
//       },
//     });
//     return response.data;
//   } catch (error) {
//     console.error('Error assigning store:', error);
//     throw error;
//   }
// };

// export const updateStore = async (data, accessToken) => {
//   try {
//     const response = await axios.patch(`${API_URL}stores`, data, {
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//         'Content-Type': 'application/json',
//       },
//     });
//     return response.data;
//   } catch (error) {
//     console.error('Error updating store:', error);
//     throw error;
//   }
// };

// export const deleteStore = async (storeId, accessToken) => {
//   try {
//     const response = await axios.delete(`${API_URL}stores/${storeId}`, {
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//       },
//     });
//     return response.data;
//   } catch (error) {
//     console.error('Error deleting store:', error);
//     throw error;
//   }
// };

// export const deactivateInventory = async (data, accessToken) => {
//   try {
//     const response = await axios.post(`${API_URL}inventory/deactivate`, data, {
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//         'Content-Type': 'application/json',
//         Accept: 'application/json, text/plain, */*',
//       },
//     });
//     return response.data;
//   } catch (error) {
//     console.error('Error deactivating inventory:', error);
//     throw error;
//   }
// };
