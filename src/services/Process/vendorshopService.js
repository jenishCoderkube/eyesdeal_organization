import api from "../api"; // Adjust path based on your project structure

const AUTH_ENDPOINTS = {
  STORES: `/stores`,
  ORDERS: `/orders`,
  VENDOR: `/vendors`,
  ORDER_COUNT: `/orders/get-count`,
  JOB_WORKS: `/jobWorks`,
  JOB_WORKS_PDF: `/jobWorks/pdf`,
  JOB_WORKS_DATA: `/vendors/updateinvoice`,
};

const buildJobWorksParams = (filters) => {
  const params = new URLSearchParams();

  // Date filters
  if (filters.startDate) {
    params.append(
      "startDate[$gte]",
      filters.startDate.toISOString().split("T")[0]
    );
  }
  if (filters.endDate) {
    params.append("endDate[$lte]", filters.endDate.toISOString().split("T")[0]);
  }

  // Store filters
  if (filters.stores && filters.stores.length) {
    filters.stores.forEach((storeId, index) => {
      params.append(`optimize[store][$in][${index}]`, storeId);
    });
  }

  // Vendor filters
  if (filters.vendors && filters.vendors.length) {
    filters.vendors.forEach((vendorId, index) => {
      params.append(`optimize[vendor][$in][${index}]`, vendorId);
    });
  }

  // Status filter
  if (filters.status) {
    params.append(`optimize[status][$in][0]`, filters.status);
  }

  // Search filter
  if (filters.search) {
    params.append("search", filters.search);
  }

  // Populate flag
  if (filters.populate) {
    params.append("populate", "true");
  }

  // Pagination
  if (filters.page) {
    params.append("page", filters.page);
  }
  if (filters.limit) {
    params.append("limit", filters.limit);
  }

  return params.toString();
};

const buildCountParams = (filters) => {
  const params = new URLSearchParams();

  // Status filters
  const statuses = filters.statuses || [
    "inWorkshop",
    "inLab",
    "inFitting",
    "ready",
  ];
  statuses.forEach((status, index) => {
    params.append(`optimize[status][$in][${index}]`, status);
  });

  // Store filters
  if (filters.stores && filters.stores.length) {
    filters.stores.forEach((storeId, index) => {
      params.append(`store._id[$in][${index}]`, storeId);
    });
  }

  // Search filter
  if (filters.search) {
    params.append("search", filters.search);
  }

  // Populate flag
  params.append("populate", "true");

  return params.toString();
};

export const vendorshopService = {
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

  getJobWorks: async (filters) => {
    try {
      const params = buildJobWorksParams(filters);
      console.log("getJobWorks params:", params, filters); // Debugging
      const response = await api.get(`${AUTH_ENDPOINTS.JOB_WORKS}?${params}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.log("error", error);

      return {
        success: false,
        message: error.response?.data?.message || "Error fetching job works",
      };
    }
  },

  getOrderCount: async (filters) => {
    try {
      const params = buildCountParams(filters);
      console.log("getOrderCount params:", filters); // Debugging
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

  getVendors: async (filters = {}) => {
    try {
      const params = new URLSearchParams({
        type: "lens_vendor",
        ...filters,
      }).toString();
      console.log("getVendors params:", params); // Debugging
      const response = await api.get(`${AUTH_ENDPOINTS.VENDOR}?${params}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error fetching vendors",
      };
    }
  },

  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await api.patch(AUTH_ENDPOINTS.ORDERS, {
        _id: orderId,
        status,
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
          `Error updating order ${orderId} status to ${status}`,
      };
    }
  },

  createJobWork: async (payload) => {
    try {
      const response = await api.post(AUTH_ENDPOINTS.JOB_WORKS, payload);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error creating job work",
      };
    }
  },

  updateOrderJobWork: async (orderId, payload) => {
    try {
      const response = await api.patch(AUTH_ENDPOINTS.ORDERS, payload);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || `Error updating order job work`,
      };
    }
  },

  updateJobWorkStatus: async (jobWorkId, status) => {
    try {
      const response = await api.patch(AUTH_ENDPOINTS.JOB_WORKS, {
        _id: jobWorkId,
        status,
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
          `Error updating job work ${jobWorkId} status to ${status}`,
      };
    }
  },
  updateJobWorkData: async (data) => {
    try {
      const response = await api.put(AUTH_ENDPOINTS.JOB_WORKS_DATA, data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          `Error updating job work ${jobWorkId} status to ${status}`,
      };
    }
  },
  updateOrderNote: async (saleId, note) => {
    try {
      const response = await api.patch(AUTH_ENDPOINTS.ORDERS, {
        _id: saleId,
        vendorNote: note, // Updated to use vendorNote field
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
          `Error updating order note for sale ${saleId}`,
      };
    }
  },

  downloadJobWorksPDF: async (payload) => {
    try {
      const response = await api.post(AUTH_ENDPOINTS.JOB_WORKS_PDF, payload, {
        responseType: "blob",
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Error downloading job works PDF",
      };
    }
  },
};

export default vendorshopService;
