import api from "./api";

// Recall endpoints
const RECALL_ENDPOINTS = {
  GET_RECALL_BY_STORE: (storeId) => `/report/recall/store?store=${storeId}`,
  UPDATE_NOTE_RECALL: `/report/recall`,
};

// Recall service functions
export const recallService = {
  getRecallByStore: async (storeId) => {
    try {
      const response = await api.get(
        RECALL_ENDPOINTS.GET_RECALL_BY_STORE(storeId)
      );
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error fetching recall data",
      };
    }
  },
  updateRecallNote: async (data) => {
    try {
      const response = await api.patch(
        RECALL_ENDPOINTS.UPDATE_NOTE_RECALL,
        data
      );
      return {
        success: response.data.success,
        data: response.data,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error updating Notes",
      };
    }
  },
};
