import api from "./api";

const PACKAGE_ENDPOINT = "/package";

export const packageService = {
  // Get all packages (with pagination)
  getPackages: async (page = 1, limit = 10, storeIds = []) => {
    try {
      // Convert array → comma-separated string
      const storeQuery =
        storeIds.length > 0 ? `&store=${storeIds.join(",")}` : "";

      const response = await api.get(
        `${PACKAGE_ENDPOINT}?page=${page}&limit=${limit}${storeQuery}`
      );
      // The actual data is in response.data.message
      return {
        success: response.data.success,
        data: response.data.message,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error fetching packages",
      };
    }
  },
  getPackagesProducs: async (page = 1, limit = 10, packageId) => {
    try {
      const response = await api.get(
        `packageOffer/${packageId}?page=${page}&limit=${limit}`
      );
      // The actual data is in response.data.message
      return {
        success: response.data.success,
        data: response.data.message,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error fetching packages",
      };
    }
  },
  // Create a new package
  createPackage: async (formData) => {
    try {
      const response = await api.post(PACKAGE_ENDPOINT, formData, {
        headers: { "Content-Type": "application/json" },
      });
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error creating package",
      };
    }
  },
  // Create a new package
  createPackageProduct: async (formData) => {
    try {
      const response = await api.post("/packageOffer", formData, {
        headers: { "Content-Type": "application/json" },
      });
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error creating package",
      };
    }
  },
  addPackageProducts: async (payload) => {
    try {
      const response = await api.post(`/package/productsAdd`, payload, {
        headers: { "Content-Type": "application/json" },
      });

      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.log("error", error);

      return {
        success: false,
        message:
          error.response?.data?.message || "Error adding package products",
      };
    }
  },
  // Update an existing package
  updatePackage: async (formData) => {
    try {
      const response = await api.patch(
        `${PACKAGE_ENDPOINT}/${formData._id}`,
        formData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      console.log("jenish<<<", response);

      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.log("error", error);

      return {
        success: false,
        message: error.response?.data?.message || "Error updating package",
      };
    }
  },
  getPackageById: async (page, limit, packageId) => {
    try {
      const response = await api.get(
        `${PACKAGE_ENDPOINT}/product/${packageId}?page=${page}&limit=${limit}`
      );
      return {
        success: response.data.success,
        data: response.data.message?.data,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error fetching package",
      };
    }
  },
  // Update an existing package
  updatePackageOffers: async (formData) => {
    try {
      const response = await api.patch(
        `packageOffer/${formData._id}`,
        formData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.log("error", error);

      return {
        success: false,
        message: error.response?.data?.message || "Error updating package",
      };
    }
  },
  // Delete a package by ID
  deletePackage: async (id) => {
    try {
      const response = await api.delete(`${PACKAGE_ENDPOINT}/${id}`);
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error deleting package",
      };
    }
  },
  // Delete a package by ID
  deletePackageProduct: async (id) => {
    try {
      const response = await api.delete(`packageOffer/${id}`);
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error deleting package",
      };
    }
  },
  getLenses: async () => {
    try {
      const response = await api.get("/products/spectacleLens");
      return {
        success: response.data.success,
        data: response.data?.data,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error fetching lenses",
      };
    }
  },
  // Bulk upload packages
  bulkUploadPackages: async (packageId, bulkUploadFile) => {
    try {
      const formData = new FormData();
      formData.append("packageId", packageId);
      formData.append("bulkUploadFile", bulkUploadFile);
      const response = await api.post("/package/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Error bulk uploading packages",
      };
    }
  },
};
