import api from "../api";

const AUTH_ENDPOINTS = {
  JOB_WORKS: `/jobWorks/get`,
  VENDORS: `/vendors`,
  STORES: `/stores`,
  CREATE_INVOICE: `/jobWorks`,
};

const buildJobWorksParams = (
  startDate,
  endDate,
  storeIds = [],
  vendorIds = [],
  search = "",
  page = 1,
  limit = 50
) => {
  const params = new URLSearchParams();

  if (startDate) {
    params.append("startDate", startDate.toISOString().split("T")[0]);
  }
  if (endDate) {
    params.append("endDate", endDate.toISOString().split("T")[0]);
  }

  storeIds.forEach((storeId, index) => {
    params.append(`store[$in][${index}]`, storeId);
  });

  vendorIds.forEach((vendorId, index) => {
    params.append(`vendor[$in][${index}]`, vendorId);
  });

  if (search) {
    params.append("search", search);
  }

  params.append("page", page.toString());
  params.append("limit", limit.toString());
  params.append("populate", "true");

  return params.toString();
};

export const vendorInvoiceService = {
  getJobWorks: async (filters) => {
    try {
      const params = buildJobWorksParams(
        filters.startDate,
        filters.endDate,
        filters.stores,
        filters.vendors,
        filters.search,
        filters.page,
        filters.limit
      );
      const payload = {
        vendor: filters.vendors,
        store: filters.stores,
        startDate: filters?.startDate?.toISOString().split("T")[0],
        endDate: filters?.endDate?.toISOString().split("T")[0],
        page: filters.page,
        limit: filters.limit,
      };
      const response = await api.post(
        `${AUTH_ENDPOINTS.JOB_WORKS}?${params}`,
        payload
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error(
        "Error fetching job works:",
        error.response?.data || error.message
      );
      return {
        success: false,
        message: error.response?.data?.message || "Error fetching job works",
      };
    }
  },

  getVendors: async () => {
    try {
      const response = await api.get(
        `${AUTH_ENDPOINTS.VENDORS}?type=lens_vendor`
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error(
        "Error fetching vendors:",
        error.response?.data || error.message
      );
      return {
        success: false,
        message: error.response?.data?.message || "Error fetching vendors",
      };
    }
  },

  getStores: async () => {
    try {
      const response = await api.get(AUTH_ENDPOINTS.STORES);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error(
        "Error fetching stores:",
        error.response?.data || error.message
      );
      return {
        success: false,
        message: error.response?.data?.message || "Error fetching stores",
      };
    }
  },

  createVendorInvoice: async (payload) => {
    try {
      console.log("Creating vendor invoice with payload:", payload);

      const response = await api.patch(AUTH_ENDPOINTS.CREATE_INVOICE, payload);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error(
        "Error creating vendor invoice:",
        error.response?.data || error.message
      );
      return {
        success: false,
        message:
          error.response?.data?.message || "Error creating vendor invoice",
      };
    }
  },
};
