import { printLogs } from "../utils/constants";
import api from "./api";

// Auth endpoints
const AUTH_ENDPOINTS = {
  STORES: `/stores`,
  VENDORS: "/vendors",
  PRODUCTS: (search) =>
    `/products/product?search=${search}&manageStock=true&activeInERP=true`,
  PURCHASELOG: (params) => `/inventory/purchase/purchaseLog?${params}`,
  INVOICELOG: (params) => `/vendors/getinvoice?${params}`,
  EXPORT: "/exportCsv",
  GENERATEBARCODE: (params) => `/products/product?search=${params}`,
  GET_PURCHASE_ORDERS: "/purchase",
  ADD_INVENTORY: "/inventory",
  PRODUCTSPurchase: (search) =>
    `/products/product?search=${search}&manageStock=true&activeInERP=true`,
  PURCHASE: "/purchase",
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
  getPurchaseOrders: async (
    dateFrom,
    dateTo,
    storeId = null,
    page = 1,
    limit = 10
  ) => {
    try {
      // Convert dates to timestamps covering the full day
      const fromTimestamp = dateFrom
        ? new Date(new Date(dateFrom).setHours(0, 0, 0, 0)).getTime()
        : undefined;
      const toTimestamp = dateTo
        ? new Date(new Date(dateTo).setHours(23, 59, 59, 999)).getTime()
        : undefined;

      const params = {
        populate: true,
        page,
        limit,
        ...(fromTimestamp && { "createdAt[$gte]": fromTimestamp }),
        ...(toTimestamp && { "createdAt[$lte]": toTimestamp }),
        ...(storeId && { "optimize[store][$in][0]": storeId }),
      };

      const response = await api.get(AUTH_ENDPOINTS.GET_PURCHASE_ORDERS, {
        params,
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
  updatePurchaseOrder: async (data) => {
    try {
      const response = await api.patch(AUTH_ENDPOINTS.PURCHASE, data);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Error updating purchase order",
      };
    }
  },
  deletePurchaseOrder: async (purchaseId) => {
    try {
      const response = await api.delete(
        `${AUTH_ENDPOINTS.PURCHASE}/${purchaseId}`
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Error deleting purchase order",
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
