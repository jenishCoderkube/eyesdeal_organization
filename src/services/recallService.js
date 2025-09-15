import api from "./api";

// Recall endpoints
const RECALL_ENDPOINTS = {
  GET_RECALL_BY_STORE: (storeId, page, limit) =>
    `/report/recall/store?store=${storeId}&page=${page}&limit=${limit}`,

  UPDATE_NOTE_RECALL: `/report/recall`,
  GET_RECALL_REPORT: `/report/recall`,
};

// Recall service functions
export const recallService = {
  getRecallByStore: async (storeId, page, limit) => {
    try {
      const response = await api.get(
        RECALL_ENDPOINTS.GET_RECALL_BY_STORE(storeId, page, limit)
      );
      console.log("response from recall by store<<<<", response);

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
  getRecallReport: async (payload) => {
    try {
      const response = await api.post(
        RECALL_ENDPOINTS.GET_RECALL_REPORT,
        payload
      );
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Error fetching recall report",
      };
    }
  },
};
