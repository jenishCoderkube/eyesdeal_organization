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
  BRAND: `master/brand`,
  INVENTORY: (params) => `/inventory?populate=true&${params}`,
  INVENTORYSTORE: (params) => `/inventory/store?populate=true&${params}`,
  INVENTORYGROUP: (params) =>
    `/inventory/get/group-wise?populate=true&${params}`,
  EXPORT: "/exportCsv",
  UNIVERSALSEARCH: (params) => `/products/product?search=${params}`,
  UNIVERSALSEARCHGET: (params) => `/inventory/store?${params}`,
  STOCKTRANSFER: (params) => `/stockTransfer?populate=true&${params}`,
  SALEINOUT : (params) => `/stockSale?populate=true&${params}`
};

const buildInventoryParams = (
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
  storeIds,
  page,
  search,
  limit
) => {
  const params = new URLSearchParams();

  // Invoice date filters
  if (_t) params.append("product.__t", _t);
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
  if (page) params.append("page", page);

  if (search) {
    params.append("search[search]", search);
  }
  if (limit) {
    params.append("limit", limit);
  }

  // Store IDs
  storeIds.forEach((storeId, index) => {
    params.append(`storesArr[${index}]`, storeId);
  });

  return params.toString();
};

const buildInventoryStoreParams = (
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
  storeIds,
  page,
  search,
  limit
) => {
  const params = new URLSearchParams();

  // Invoice date filters
  if (_t) params.append("product.__t", _t);
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
  if (page) params.append("page", page);

  if (search) {
    params.append("search[search]", search);
  }
  if (limit) {
    params.append("limit", limit);
  }

  // Store IDs
  storeIds.forEach((storeId, index) => {
    params.append(`optimize[store][$in][${index}]`, storeId);
  });

  return params.toString();
};

const buildGroupStoreParams = (brandId, storeIds, page, search, limit) => {
  const params = new URLSearchParams();

  if (page) params.append("page", page);

  if (search) {
    params.append("search[search]", search);
  }
  if (limit) {
    params.append("limit", limit);
  }

  brandId.forEach((brandId, index) => {
    params.append(`optimize[brand][$in][${index}]`, brandId);
  });

  // Store IDs
  storeIds.forEach((storeId, index) => {
    params.append(`optimize[store][$in][${index}]`, storeId);
  });

  return params.toString();
};

const buildProductStoreParams = (productIds, page, limit) => {
  const params = new URLSearchParams();

  if (page) params.append("page", page);

  if (limit) {
    params.append("limit", limit);
  }

  // Store IDs
  productIds.forEach((productIds, index) => {
    params.append(`product._id[$in][${index}]`, productIds);
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

  getBrand: async () => {
    try {
      const response = await api.get(INVENTORY_ENDPOINTS.BRAND);
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
    storeIds = [],
    page,
    search,
    limit
  ) => {
    try {
      let params = buildInventoryParams(
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
        storeIds,
        page,
        search,
        limit
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

  getInventoryStore: async (
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
    storeIds = [],
    page,
    search,
    limit
  ) => {
    try {
      let params = buildInventoryStoreParams(
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
        storeIds,
        page,
        search,
        limit
      );
      const response = await api.get(
        INVENTORY_ENDPOINTS.INVENTORYSTORE(params)
      );

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

  getProductStore: async (productIds = [], page, limit) => {
    try {
      let params = buildProductStoreParams(productIds, page, limit);
      const response = await api.get(
        INVENTORY_ENDPOINTS.UNIVERSALSEARCHGET(params)
      );

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

  getGroupStore: async (brandIds = [], storeIds = [], page, search, limit) => {
    try {
      let params = buildGroupStoreParams(
        brandIds,
        storeIds,
        page,
        search,
        limit
      );
      const response = await api.get(
        INVENTORY_ENDPOINTS.INVENTORYGROUP(params)
      );

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

  exportCsv: async (data) => {
    try {
      const response = await api.post(INVENTORY_ENDPOINTS.EXPORT, data);
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

  universalSearch: async (search) => {
    try {
      const response = await api.get(
        INVENTORY_ENDPOINTS.UNIVERSALSEARCH(search)
      );
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

  stockTransfer: async (params) => {
    try {
      const response = await api.get(INVENTORY_ENDPOINTS.STOCKTRANSFER(params));

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

  stockReceive: async (params) => {
    try {
      const response = await api.get(INVENTORY_ENDPOINTS.SALEINOUT(params));

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.log("error",error)
      return {
        success: false,
        message: error.response?.data?.message || "Error",
      };
    }
  },
};
