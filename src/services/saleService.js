import api from "./api";

// Sale endpoints
const SALE_ENDPOINTS = {
    LIST_USERS: "/user/list",
    SALES: "/sales",
    MARKETINGREFERENCES: "/user/marketingReferences",
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
    sales: async (customerId = "") => {
        try {
            const params = {
                customerId,        
                populate: true,
                limit: 50,
                page: 1
            };

            const response = await api.get(SALE_ENDPOINTS.SALES, { params });

            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || "Error fetching customer's sales data",
            };
        }
    },
    getUser: async (_id = "") => {
        try {
            const params = {
                _id,        
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
                message: error.response?.data?.message || "Error fetching user data",
            };
        }
    },
    getMarketingReferences: async () => {
        try {
            const response = await api.get(SALE_ENDPOINTS.MARKETINGREFERENCES);

            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || "Error fetching user data",
            };
        }
    },
};
