import api from "../api"; // Adjust path based on your structure

const AUTH_ENDPOINTS = {
  STORES: `/stores`,
  SALES: `/sales`,
  ORDER_COUNT: `/orders/get-count`,
  SALE_RETURN_COUNT: `/saleReturn/total/count`,
  ORDERS: `/orders`,
  USER: `/user/list`,
};

const buildPurchaseLogParams = (
  invoiceDateGte,
  invoiceDateLte,
  storeIds = [],
  status,
  search = "",
  createdAtGte,
  createdAtLte
) => {
  const params = new URLSearchParams();

  if (invoiceDateGte) params.append("invoiceDate[$gte]", invoiceDateGte);
  if (invoiceDateLte) params.append("invoiceDate[$lte]", invoiceDateLte);
  if (createdAtGte) params.append("createdAt[$gte]", createdAtGte);
  if (createdAtLte) params.append("createdAt[$lte]", createdAtLte);

  storeIds.forEach((storeId, index) => {
    params.append(`optimize[store][$in][${index}]`, storeId);
  });

  if (Array.isArray(status)) {
    status.forEach((stat, index) => {
      params.append(`orders.status[$in][${index}]`, stat);
    });
  } else if (status) {
    params.append(`orders.status[$in][0]`, status);
  }

  if (search) params.append("search", search);

  params.append("populate", "true");

  return params.toString();
};

const buildCountParams = (storeIds = [], search = "") => {
  const params = new URLSearchParams();

  storeIds.forEach((storeId, index) => {
    params.append(`optimize[store][$in][${index}]`, storeId);
  });

  if (search) params.append("search", search);

  params.append("populate", "true");

  return params.toString();
};

const buildUserParams = (userId) => {
  const params = new URLSearchParams();
  params.append("_id", userId);
  params.append("populate", "true");
  return params.toString();
};

export const shopProcessService = {
  getStores: async () => {
    try {
      const response = await api.get(AUTH_ENDPOINTS.STORES);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error fetching stores",
      };
    }
  },

  getSales: async (filters) => {
    try {
      const params = buildPurchaseLogParams(
        filters.startDate
          ? filters.startDate.toISOString().split("T")[0]
          : null,
        filters.endDate ? filters.endDate.toISOString().split("T")[0] : null,
        filters.stores,
        filters.status,
        filters.search,
        filters.createdAtGte,
        filters.createdAtLte
      );
      const response = await api.get(`${AUTH_ENDPOINTS.SALES}?${params}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error fetching sales",
      };
    }
  },

  getOrderCount: async (filters) => {
    try {
      const params = buildCountParams(filters.stores, filters.search);
      const response = await api.get(`${AUTH_ENDPOINTS.ORDER_COUNT}?${params}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error fetching order count",
      };
    }
  },

  getSaleReturnCount: async (filters) => {
    try {
      const params = buildCountParams(filters.stores, filters.search);
      const response = await api.get(
        `${AUTH_ENDPOINTS.SALE_RETURN_COUNT}?${params}`
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Error fetching sale return count",
      };
    }
  },

  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await api.patch(AUTH_ENDPOINTS.ORDERS, {
        _id: orderId,
        status: status,
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          `Error updating order status to ${status}`,
      };
    }
  },

  updateSale: async (saleId, data) => {
    try {
      const response = await api.patch(`${AUTH_ENDPOINTS.SALES}`, {
        _id: saleId,
        ...data,
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error updating sale",
      };
    }
  },

  getUser: async (userId) => {
    try {
      const params = buildUserParams(userId);
      const response = await api.get(`${AUTH_ENDPOINTS.USER}?${params}`);
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
  deleteSale: async (saleId) => {
    try {
      const response = await api.delete(`${AUTH_ENDPOINTS.SALES}/${saleId}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error deleting sale",
      };
    }
  },
  getSaleById: async (saleId) => {
    try {
      const params = new URLSearchParams();
      params.append("_id", saleId);
      params.append("populate", "true");
      const response = await api.get(`${AUTH_ENDPOINTS.SALES}?${params}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error fetching sale",
      };
    }
  },
};
