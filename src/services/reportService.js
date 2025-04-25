import api from "./api";

// Auth endpoints
const REPORTS_ENDPOINTS = {
  STORES: `/stores`,
  CATEGORY: `/expenseCategory`,
  ORDERS: `/orders`,
};

// Auth service functions
export const reportService = {
  getStores: async () => {
    try {
      const response = await api.get(REPORTS_ENDPOINTS.STORES);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error",
      };
    }
  },

  getCategory: async () => {
    try {
      const response = await api.get(REPORTS_ENDPOINTS.CATEGORY);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error",
      };
    }
  },
  getOrders: async (page, fromDate, toDate) => {
    try {
      const response = await api.get(REPORTS_ENDPOINTS.ORDERS, {
        params: {
          populate: true,
          page: page,
          "createdAt[$gte]": fromDate ?? "",
          "createdAt[$lte]": toDate ?? "",
        },
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error",
      };
    }
  },
};
