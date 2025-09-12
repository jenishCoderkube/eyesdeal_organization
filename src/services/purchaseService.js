import { printLogs } from "../utils/constants";
import api from "./api";

// Auth endpoints
const AUTH_ENDPOINTS = {
  STORES: `/stores`,
  VENDORS: "/vendors",
  PRODUCTS: (search) =>
    `/products/product?search=${search}&manageStock=true&activeInERP=true`,
  PURCHASELOG: (params) => `/inventory/purchase/purchaseLog?${params}`,
  INVOICELOG: (params) => `/jobWorks?${params}`,
  EXPORT: "/exportCsv",
  GENERATEBARCODE: (params) => `/products/product?search=${params}`,
  ADD_INVENTORY: "/inventory",
};

const buildPurchaseLogParams = (
  invoiceDateGte,
  invoiceDateLte,
  storeIds = [],
  vendorIds = [],
  page,
  rowsPerPage
) => {
  const params = new URLSearchParams();

  // Invoice date filters
  if (invoiceDateGte) params.append("invoiceDate[$gte]", invoiceDateGte);
  if (invoiceDateLte) params.append("invoiceDate[$lte]", invoiceDateLte);
  params.append("page", page);
  params.append("limit", rowsPerPage);
  // Store IDs
  storeIds.forEach((storeId, index) => {
    params.append(`optimize[store][$in][${index}]`, storeId);
  });

  // Vendor IDs
  vendorIds.forEach((vendorId, index) => {
    params.append(`optimize[vendor][$in][${index}]`, vendorId);
  });

  return params.toString();
};
// Auth service functions
export const purchaseService = {
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
        message: error.response?.data?.message || "Error checking store",
      };
    }
  },
  getVendorsByType: async (type) => {
    try {
      const params = { type };
      const response = await api.get(AUTH_ENDPOINTS.VENDORS, { params });

      if (response.data.success) {
        return {
          success: true,
          message: response.data.message,
          data: response.data.data,
        };
      }
      return {
        success: false,
        message: response.data.message || "Error",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error",
      };
    }
  },
  getVendors: async () => {
    try {
      const response = await api.get(AUTH_ENDPOINTS.VENDORS);

      if (response.data.success) {
        return {
          success: true,
          message: response.data.message,
          data: response.data.data,
        };
      }
      return {
        success: false,
        message: response.data.message || "Error",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error",
      };
    }
  },
  searchProduct: async (search) => {
    try {
      const response = await api.get(AUTH_ENDPOINTS.PRODUCTS(search));
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

  getPurchaseLog: async (
    invoiceDateGte,
    invoiceDateLte,
    storeIds = [],
    vendorIds = [],
    page,
    rowsPerPage
  ) => {
    try {
      let params = buildPurchaseLogParams(
        invoiceDateGte,
        invoiceDateLte,
        storeIds,
        vendorIds,
        page,
        rowsPerPage
      );
      const response = await api.get(AUTH_ENDPOINTS.PURCHASELOG(params));

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
  getInvoices: async (
    invoiceDateGte,
    invoiceDateLte,
    storeIds = [],
    vendorIds = [],
    page,
    rowsPerPage
  ) => {
    try {
      let params = buildPurchaseLogParams(
        invoiceDateGte,
        invoiceDateLte,
        storeIds,
        vendorIds,
        page,
        rowsPerPage
      );
      console.log("invoice params", page, rowsPerPage);

      const response = await api.get(AUTH_ENDPOINTS.INVOICELOG(params));

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
  exportCsv: async (data) => {
    try {
      const response = await api.post(AUTH_ENDPOINTS.EXPORT, data);
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

  generateBarcode: async (search) => {
    try {
      const response = await api.get(AUTH_ENDPOINTS.GENERATEBARCODE(search));
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
  addInventory: async (data) => {
    try {
      const response = await api.post(AUTH_ENDPOINTS.ADD_INVENTORY, data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error adding inventory",
      };
    }
  },
};
