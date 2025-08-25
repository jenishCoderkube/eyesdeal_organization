import { printLogs } from "../utils/constants";
import api from "./api";

// Auth endpoints
const CASHBOOK_ENDPOINTS = {
  STORES: `/stores`,
  CATEGORY: (search) =>
    search
      ? `/expenseCategory?search=${encodeURIComponent(search)}`
      : `/expenseCategory`,
  ADDEXPENSE: "/cashbook",
  CREATEEXPENSE: "/expenseCategory",
  DELETEEXPENSE: (id) => `/expenseCategory/${id}`,
  VIEWCASHBOOK: `/stores?populate=true`,
  CASEBOOK: (mode, params) => `cashbook/${mode}?populate=true&${params}`,
};

const buildViewCashBookParams = (
  createdAtGte,
  createdAtLte,
  storeIds = [],
  page,
  limit,
  sort,
  search
) => {
  const params = new URLSearchParams();

  // Invoice date filters
  if (createdAtGte) params.append("createdAt[$gte]", createdAtGte);
  if (createdAtLte) params.append("createdAt[$lte]", createdAtLte);

  // Store IDs
  storeIds.forEach((storeId, index) => {
    params.append(`optimize[store][$in][${index}]`, storeId);
  });

  if (page) {
    params.append("page", page);
  }

  if (limit) {
    params.append("limit", limit);
  }

  if (sort) {
    params.append("sort[createdAt]", sort);
  }
  if (search) {
    params.append("search", search);
  }

  return params.toString();
};

// Auth service functions
export const cashbookService = {
  getStores: async () => {
    try {
      const response = await api.get(CASHBOOK_ENDPOINTS.STORES);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error checking store",
      };
    }
  },

  getCategory: async (search) => {
    try {
      const response = await api.get(CASHBOOK_ENDPOINTS.CATEGORY(search));
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error checking store",
      };
    }
  },

  addExpense: async (data) => {
    try {
      const response = await api.post(CASHBOOK_ENDPOINTS.ADDEXPENSE, data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error checking store",
      };
    }
  },

  createExpense: async (data) => {
    try {
      const response = await api.post(CASHBOOK_ENDPOINTS.CREATEEXPENSE, data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error checking store",
      };
    }
  },

  deleteExpense: async (id) => {
    try {
      const response = await api.delete(CASHBOOK_ENDPOINTS.DELETEEXPENSE(id));
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error checking store",
      };
    }
  },

  viewCashBook: async () => {
    try {
      const response = await api.get(CASHBOOK_ENDPOINTS.VIEWCASHBOOK);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error checking store",
      };
    }
  },

  cashBook: async (
    createdAtGte,
    createdAtLte,
    storeIds = [],
    page,
    limit,
    sort,
    search,
    mode
  ) => {
    try {
      let params = buildViewCashBookParams(
        createdAtGte,
        createdAtLte,
        storeIds,
        page,
        limit,
        sort,
        search,
        mode
      );
      const response = await api.get(CASHBOOK_ENDPOINTS.CASEBOOK(mode, params));

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      printLogs(error);

      return {
        success: false,
        message: error.response?.data?.message || "Error",
      };
    }
  },
};
