// src/services/Products/productViewService.js
import api from "../api"; // Adjust path based on your project structure

const ENDPOINTS = {
  BRANDS: "/master/brand",
  FRAME_TYPES: "/master/frameType",
  FRAME_SHAPES: "/master/frameShape",
  FRAME_MATERIALS: "/master/material",
  FRAME_COLORS: "/master/color",
  PRESCRIPTION_TYPES: "/master/prescriptionType",
  FRAME_COLLECTIONS: "/master/collection",
  PRODUCTS: (model) => `/products/${model}`,
  PRODUCTBYID: (model, productId, isB2B, populate = "features") =>
    `/master/${model}?_id=${productId}&isB2B=${isB2B}${
      populate ? `&populate=${populate}` : ""
    }`,

  DELETEPRODUCTBYID: (model, productId) => `/products/${model}/${productId}`,
  EXPORT_CSV: "/exportCsv",
  GET_PRODUCTS_COLORS: "/website/single-product",
  ADD_TO_CART_PRODUCT_PURCHASE: "/purchase",
  MEDIA_LIBRARY: "/mediaLibrary",
};

const productViewService = {
  getBrands: async () => {
    try {
      const response = await api.get(ENDPOINTS.BRANDS);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error fetching brands",
      };
    }
  },
  getFrameTypes: async () => {
    try {
      const response = await api.get(ENDPOINTS.FRAME_TYPES);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error fetching frame types",
      };
    }
  },
  getFrameShapes: async () => {
    try {
      const response = await api.get(ENDPOINTS.FRAME_SHAPES);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error fetching frame shapes",
      };
    }
  },
  getFrameMaterials: async () => {
    try {
      const response = await api.get(ENDPOINTS.FRAME_MATERIALS);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Error fetching frame materials",
      };
    }
  },
  getFrameColors: async () => {
    try {
      const response = await api.get(ENDPOINTS.FRAME_COLORS);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error fetching frame colors",
      };
    }
  },
  getPrescriptionTypes: async () => {
    try {
      const response = await api.get(ENDPOINTS.PRESCRIPTION_TYPES);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Error fetching prescription types",
      };
    }
  },
  getFrameCollections: async () => {
    try {
      const response = await api.get(ENDPOINTS.FRAME_COLLECTIONS);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Error fetching frame collections",
      };
    }
  },
  fetchAndUpdateProductPhotos: async (productId, ObservationId) => {
    try {
      const searchResponse = await api.get(
        `/mediaLibrary/search?search=${ObservationId}`
      );
      if (!searchResponse.data.success) {
        return {
          success: false,
          message: searchResponse.data.message || "Error fetching photos",
        };
      }

      const photos = searchResponse.data.data.map((item) => item.Key);
      const patchResponse = await api.patch(`/products/eyeGlasses`, {
        _id: productId,
        photos,
      });

      if (
        patchResponse.data.acknowledged &&
        patchResponse.data.modifiedCount > 0
      ) {
        return {
          success: true,
          data: { _id: productId, photos },
        };
      } else {
        return {
          success: false,
          message: "Failed to update product photos",
        };
      }
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Error updating product photos",
      };
    }
  },
  getProducts: async (model, filters = {}, page = 1, limit) => {
    try {
      const baseUrl = `${ENDPOINTS.PRODUCTS(model)}`;
      const queryParams = new URLSearchParams();
      limit && queryParams.append("limit", limit);

      if (page > 1) {
        queryParams.append("page", page);
      }

      // Set activeInWebsite=true by default
      queryParams.append("optimize[activeInERP]", true);

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value && key !== "model") {
            if (key === "search") {
              queryParams.append("search", value);
            } else if (key === "status") {
              queryParams.set(
                "optimize[activeInERP]",
                value === "active" ? true : false
              );
            } else {
              queryParams.append(`optimize[${key}]`, value);
            }
          }
        });
      }

      const url = `${baseUrl}${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      const response = await api.get(url);
      return {
        success: true,
        data: response.data.data.docs,
        other: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error fetching products",
      };
    }
  },
  getProductById: async (model, productId, isB2B = true) => {
    try {
      const response = await api.get(
        `${ENDPOINTS.PRODUCTBYID(model, productId, isB2B)}`
      );
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error fetching product",
      };
    }
  },
  getProductsColors: async (brand, model, __t, isB2B) => {
    try {
      const response = await api.post(`${ENDPOINTS.GET_PRODUCTS_COLORS}`, {
        "brand._id": brand,
        modelNumber: model,
        __t: __t,
        isB2B: isB2B,
      });
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error fetching product",
      };
    }
  },
  addToCartProductPurchase: async (productsArray) => {
    try {
      // productsArray should be like:
      // [{ product: "id1", quantity: 2, store: "storeId", user: "userId" }, {...}]
      const response = await api.post(
        `${ENDPOINTS.ADD_TO_CART_PRODUCT_PURCHASE}`,
        productsArray
      );

      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error fetching product",
      };
    }
  },

  getProductsPurchase: async (model, filters = {}, page = 1, limit) => {
    try {
      const baseUrl = `${ENDPOINTS.PRODUCTS(model)}`;
      const queryParams = new URLSearchParams();
      limit && queryParams.append("limit", limit);

      if (page > 1) {
        queryParams.append("page", page);
      }

      // Set activeInWebsite=true by default
      // queryParams.append("optimize[activeInERP]", true);

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value && key !== "model") {
            if (key === "search") {
              queryParams.append("search", value);
            } else if (key === "status") {
              queryParams.set(
                "optimize[activeInERP]",
                value === "active" ? true : false
              );
            } else {
              queryParams.append(`optimize[${key}]`, value);
            }
          }
        });
      }

      const url = `${baseUrl}${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      const response = await api.get(url);
      return {
        success: true,
        data: response.data.data.docs,
        other: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error fetching products",
      };
    }
  },
  deleteProductById: async (model, productId) => {
    try {
      const response = await api.delete(
        `${ENDPOINTS.DELETEPRODUCTBYID(model, productId)}`
      );
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error deleting product",
      };
    }
  },
  exportCsv: async (payload) => {
    try {
      const response = await api.post(ENDPOINTS.EXPORT_CSV, payload);
      return {
        success: true,
        data: response.data,
        message: response.data.message || "CSV exported successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error exporting CSV",
      };
    }
  },
  updateEyeGlasses: async (productId, payload, model) => {
    try {
      const response = await api.patch(ENDPOINTS.PRODUCTS(model), payload);
      return {
        success: response.data.acknowledged && response.data.modifiedCount > 0,
        data: response.data,
        message: response.data.message || "Product updated successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error updating product",
      };
    }
  },
  updateAccessories: async (productId, payload, model) => {
    try {
      const response = await api.patch(ENDPOINTS.PRODUCTS(model), payload);
      return {
        success: response.data.acknowledged && response.data.modifiedCount > 0,
        data: response.data,
        message: response.data.message || "Product updated successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error updating product",
      };
    }
  },
  updateSunGlasses: async (productId, payload, model) => {
    try {
      const response = await api.patch(ENDPOINTS.PRODUCTS(model), payload);
      return {
        success: response.data.acknowledged && response.data.modifiedCount > 0,
        data: response.data,
        message: response.data.message || "Product updated successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error updating product",
      };
    }
  },
  updateSpectacleLens: async (productId, payload, model) => {
    try {
      const response = await api.patch(ENDPOINTS.PRODUCTS(model), payload);
      return {
        success: response.data.acknowledged && response.data.modifiedCount > 0,
        data: response.data,
        message: response.data.message || "Product updated successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error updating product",
      };
    }
  },
  updateProductData: async (productId, payload, model) => {
    try {
      const response = await api.patch(ENDPOINTS.PRODUCTS(model), payload);
      return {
        success: response.data.acknowledged && response.data.modifiedCount > 0,
        data: response.data,
        message: response.data.message || "Product updated successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error updating product",
      };
    }
  },
  getMediaLibrary: async (currentFolder = "/") => {
    try {
      const response = await api.get(ENDPOINTS.MEDIA_LIBRARY, {
        params: { currentFolder },
      });
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message || "Media library fetched successfully",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Error fetching media library",
      };
    }
  },
};

export default productViewService;
