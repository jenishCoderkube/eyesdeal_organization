import { printLogs } from "../utils/constants";
import api from "./api";

// Auth endpoints
const AUTH_ENDPOINTS = {
  STORES: `/stores`,
  VENDORSTYPE: "/vendors?type=purchase_vendor",
  VENDORS: "/vendors",
  PRODUCTS: (search) => `/products/product?search=${search}&manageStock=true`,
  PURCHASELOG: (params) => `/inventory/purchase/purchaseLog?${params}`,
  EXPORT: "/exportCsv",
  GENERATEBARCODE: (params) => `/products/product?search=${params}`,
};

const buildPurchaseLogParams = (
  invoiceDateGte,
  invoiceDateLte,
  storeIds = [],
  vendorIds = []
) => {
  const params = new URLSearchParams();

  // Invoice date filters
  if (invoiceDateGte) params.append("invoiceDate[$gte]", invoiceDateGte);
  if (invoiceDateLte) params.append("invoiceDate[$lte]", invoiceDateLte);

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
  getVendorsByType: async () => {
    try {
      const response = await api.get(AUTH_ENDPOINTS.VENDORSTYPE);

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
    vendorIds = []
  ) => {
    try {
      let params = buildPurchaseLogParams(
        invoiceDateGte,
        invoiceDateLte,
        storeIds,
        vendorIds
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
};
