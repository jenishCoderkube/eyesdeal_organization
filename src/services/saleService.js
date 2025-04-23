import api from "./api";

// Sale endpoints
const SALE_ENDPOINTS = {
  LIST_USERS: "/user/list",
};

// sale service functions
export const saleService = {
  listUsers: async (search = "") => {
    try {
      const params = {
        search,
        role: "customer",
        populate: true,
      };

      const response = await api.get(SALE_ENDPOINTS.LIST_USERS, { params });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error fetching customers",
      };
    }
  },
};
