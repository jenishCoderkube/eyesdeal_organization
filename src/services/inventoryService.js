import api from "./api";

// Auth endpoints
const INVENTORY_ENDPOINTS = {
  STORES: `/stores`,
  CATEGORY: `/expenseCategory`,
  FRAMETYPE: `/master/frameType`,
  FRAMESHAPE: `/master/frameShape`,
  MATERIAL: "/master/material",
  COLOR: "/master/color",
  PRESCRIPTION: `master/prescriptionType`,
  COLLECTION: `master/collection`,
  INVENTORY: (params) => `cashbook/cash?populate=true&${params}`,
};

const buildPurchaseLogParams = (
  _t,
  brand,
  gender,
  frameSize,
  frameType_id,
  frameShape_id,
  frameMaterial_id,
  frameColor_id,
  frameCollection_id,
  prescriptionType_id,
  storeIds = []
) => {
  const params = new URLSearchParams();

  // Invoice date filters
  if (_t) params.append("product._t", _t);
  if (brand) params.append("product.brand", brand);
  if (gender) params.append("product.gender", gender);
  if (frameSize) params.append("product.frameSize", frameSize);
  if (frameType_id) params.append("product.frameType._id", frameType_id);
  if (frameShape_id) params.append("product.frameShape._id", frameShape_id);
  if (frameMaterial_id)
    params.append("product.frameMaterial._id", frameMaterial_id);
  if (frameColor_id) params.append("product.frameColor._id", frameColor_id);
  if (frameCollection_id)
    params.append("product.frameCollection._id", frameCollection_id);
  if (prescriptionType_id)
    params.append("product.prescriptionType._id", prescriptionType_id);

  // Store IDs
  storeIds.forEach((storeId, index) => {
    params.append(`storeArr[${index}]`, storeId);
  });

  return params.toString();
};

// Auth service functions
export const inventoryService = {
  getStores: async () => {
    try {
      const response = await api.get(INVENTORY_ENDPOINTS.STORES);
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

  getCategory: async () => {
    try {
      const response = await api.get(INVENTORY_ENDPOINTS.CATEGORY);
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

  getFrameType: async () => {
    try {
      const response = await api.get(INVENTORY_ENDPOINTS.FRAMETYPE);
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

  getFrameShape: async () => {
    try {
      const response = await api.get(INVENTORY_ENDPOINTS.FRAMESHAPE);
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
  getMaterial: async () => {
    try {
      const response = await api.get(INVENTORY_ENDPOINTS.MATERIAL);
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

  getColor: async () => {
    try {
      const response = await api.get(INVENTORY_ENDPOINTS.COLOR);
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

  getPrescriptionType: async () => {
    try {
      const response = await api.get(INVENTORY_ENDPOINTS.PRESCRIPTION);
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

  getCollection: async () => {
    try {
      const response = await api.get(INVENTORY_ENDPOINTS.COLLECTION);
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

  getInventory: async (
    _t,
    brand,
    gender,
    frameSize,
    frameType_id,
    frameShape_id,
    frameMaterial_id,
    frameColor_id,
    frameCollection_id,
    prescriptionType_id,
    storeIds = []
  ) => {
    try {
      let params = buildPurchaseLogParams(
        _t,
        brand,
        gender,
        frameSize,
        frameType_id,
        frameShape_id,
        frameMaterial_id,
        frameColor_id,
        frameCollection_id,
        prescriptionType_id,
        (storeIds = [])
      );
      const response = await api.get(INVENTORY_ENDPOINTS.INVENTORY(params));

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
