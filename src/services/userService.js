import api from "./api";

// Sale endpoints
const USER_ENDPOINTS = {
  ADD_ORGANIZATION: "/organization",
  ADD_CUSTOMER: "/user/register",
  ADD_EMPLOYEE: "/user/register",
  GET_STORES: "/stores",
  GET_EMPLOYEES: "/user/list",
  GET_EMPLOYEE_BY_ID: "/user/list",
  UPDATE_EMPLOYEE: "/user/update",
  GET_CUSTOMERS: "/user/list",
  UPDATE_CUSTOMER: "/user/update",
  DELETE_CUSTOMER: "/user/remove",
  GET_OTP: "/otp",
  GET_VENDORS: "/vendors",
  ADD_VENDOR: "/vendors",
  UPDATE_VENDOR: "/vendors",
  GET_VENDOR_BY_ID: "/vendors",
  DELETE_VENDOR: "/vendors",
  GET_MARKETING_REFERENCES: "/user/marketingReferences",
  GET_MARKETING_REFERENCE_BY_ID: "/user/marketingReferences",
  ADD_MARKETING_REFERENCE: "/user/marketingReferences",
  UPDATE_MARKETING_REFERENCE: "/user/marketingReferences",
  DELETE_MARKETING_REFERENCE: "/user/marketingReferences",
  IS_MARKETING_REFERENCE_EXISTS: "/user/marketingReferences/exists",
};

// sale service functions
export const userService = {
  addOrganization: async (data) => {
    try {
      const response = await api.post(USER_ENDPOINTS.ADD_ORGANIZATION, data);

      return {
        success: true,
        data: response.data,
        message: "Organization added successfully.",
      };
    } catch (error) {
      return {
        success: false,
        message: error?.response?.data?.message || "Error adding organization",
      };
    }
  },

  addCustomer: async (data) => {
    try {
      const response = await api.post(USER_ENDPOINTS.ADD_CUSTOMER, data);
      return {
        success: true,
        data: response.data,
        message: "Customer added successfully.",
      };
    } catch (error) {
      return {
        success: false,
        message: error?.response?.data?.message || "Error adding customer",
      };
    }
  },

  addEmployee: async (data) => {
    try {
      const response = await api.post(USER_ENDPOINTS.ADD_EMPLOYEE, data);
      return {
        success: true,
        data: response.data,
        message: "Employee added successfully.",
      };
    } catch (error) {
      return {
        success: false,
        message: error?.response?.data?.message || "Error adding employee",
      };
    }
  },
  getStores: async () => {
    try {
      const response = await api.get(USER_ENDPOINTS.GET_STORES);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error?.response?.data?.message || "Error fetching stores!",
      };
    }
  },
  getEmployees: async ({ page = 1, limit = 10, search = "" } = {}) => {
    try {
      const response = await api.get(USER_ENDPOINTS.GET_EMPLOYEES, {
        params: {
          "role[$ne]": "customer",
          populate: true,
          page,
          limit,
          search,
        },
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error?.response?.data?.message || "Error fetching employees!",
      };
    }
  },
  getEmployeeById: async (id) => {
    try {
      const response = await api.get(USER_ENDPOINTS.GET_EMPLOYEES, {
        params: {
          _id: id,
        },
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error?.response?.data?.message || "Error fetching employee detail!",
      };
    }
  },
  updateEmployee: async (data) => {
    try {
      const response = await api.patch(USER_ENDPOINTS.UPDATE_EMPLOYEE, data);
      return {
        success: true,
        data: response.data,
        message: "Employee details updated successfully!",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error?.response?.data?.message || "Error updating employee detail!",
      };
    }
  },
  getCustomers: async ({ page = 1, limit = 10, search = "" } = {}) => {
    try {
      const response = await api.get(USER_ENDPOINTS.GET_CUSTOMERS, {
        params: {
          role: "customer",
          page,
          limit,
          search, // backend should handle filtering by name/phone/etc.
        },
      });

      return {
        success: true,
        data: response.data, // contains { docs, totalPages, totalDocs, page }
      };
    } catch (error) {
      return {
        success: false,
        message: error?.response?.data?.message || "Error fetching customers!",
      };
    }
  },

  updateCustomer: async (data) => {
    try {
      const response = await api.patch(USER_ENDPOINTS.UPDATE_CUSTOMER, data);
      return {
        success: true,
        data: response.data,
        message: "Customer details updated successfully!",
      };
    } catch (error) {
      return {
        success: false,
        message: error?.response?.data?.message || "Error updating customer!",
      };
    }
  },
  deleteCustomer: async (id) => {
    try {
      const response = await api.delete(
        `${USER_ENDPOINTS.DELETE_CUSTOMER}/${id}`
      );
      return {
        success: true,
        data: response.data,
        message: "Customer deleted successfully!",
      };
    } catch (error) {
      return {
        success: false,
        message: error?.response?.data?.message || "Error deleting customer!",
      };
    }
  },
  getOTP: async (page) => {
    try {
      const response = await api.get(USER_ENDPOINTS.GET_OTP, {
        params: {
          page: page,
          limit: 5000,
        },
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error?.response?.data?.message || "Error fetching OTP!",
      };
    }
  },
  getVendors: async ({ page, limit = 20, search = "" }, { signal }) => {
    try {
      const response = await api.get(USER_ENDPOINTS.GET_VENDORS, {
        params: {
          page: page,
          search: search,
          limit: limit,
        },
        signal,
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error?.response?.data?.message || "Error fetching vendors!",
      };
    }
  },
  addVendor: async (data) => {
    try {
      const response = await api.post(USER_ENDPOINTS.ADD_VENDOR, data);
      return {
        success: true,
        data: response.data,
        message: "Vendor added successfully!",
      };
    } catch (error) {
      return {
        success: false,
        message: error?.response?.data?.message || "Error adding vendors!",
      };
    }
  },
  updateVendor: async (data) => {
    try {
      const response = await api.patch(USER_ENDPOINTS.UPDATE_VENDOR, data);
      return {
        success: true,
        data: response.data,
        message: "Vendor update successfully!",
      };
    } catch (error) {
      return {
        success: false,
        message: error?.response?.data?.message || "Error updating vendors!",
      };
    }
  },
  getVendorById: async (_id) => {
    try {
      const response = await api.get(USER_ENDPOINTS.GET_VENDOR_BY_ID, {
        params: { _id },
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error?.response?.data?.message || "Error fetching vendor details!",
      };
    }
  },
  deleteVendor: async (id) => {
    try {
      const response = await api.delete(
        `${USER_ENDPOINTS.DELETE_VENDOR}/${id}`
      );
      return {
        success: true,
        data: response.data,
        message: "Vendor deleted successfully!",
      };
    } catch (error) {
      return {
        success: false,
        message: error?.response?.data?.message || "Error deleting vendor!",
      };
    }
  },
  getMarketingReferences: async ({ page, limit, search }) => {
    try {
      const response = await api.get(USER_ENDPOINTS.GET_MARKETING_REFERENCES, {
        params: { page, limit, search },
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error?.response?.data?.message || "Error fetching vendors!",
      };
    }
  },
  addMarketingReference: async (data) => {
    try {
      const response = await api.post(
        USER_ENDPOINTS.ADD_MARKETING_REFERENCE,
        data
      );
      return {
        success: true,
        data: response.data,
        message: "Marketing reference added successfully!",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error?.response?.data?.message || "Error adding marketing reference!",
      };
    }
  },
  updateMarketingReference: async (data) => {
    try {
      const response = await api.patch(
        USER_ENDPOINTS.UPDATE_MARKETING_REFERENCE,
        data
      );
      return {
        success: true,
        data: response.data,
        message: "Marketing reference update successfully!",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error?.response?.data?.message ||
          "Error updating marketing reference!",
      };
    }
  },
  getMarketingReferenceById: async (id) => {
    try {
      const response = await api.get(
        `${USER_ENDPOINTS.GET_MARKETING_REFERENCE_BY_ID}/${id}`
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error?.response?.data?.message ||
          "Error fetching marketing reference details!",
      };
    }
  },
  deleteMarketingReference: async (id) => {
    try {
      const response = await api.delete(
        `${USER_ENDPOINTS.DELETE_MARKETING_REFERENCE}/${id}`
      );
      return {
        success: true,
        data: response.data,
        message: "Marketing reference deleted successfully!",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error?.response?.data?.message ||
          "Error deleting marketing reference!",
      };
    }
  },
  isMarketingRefernceExists: async (name) => {
    try {
      const response = await api.get(
        `${USER_ENDPOINTS.IS_MARKETING_REFERENCE_EXISTS}/${name}`
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error?.response?.data?.message ||
          "Error checking marketing reference existence!",
      };
    }
  },
};
