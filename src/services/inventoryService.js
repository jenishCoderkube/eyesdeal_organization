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
  INVENTORYGETCOUNT: (params) => `/inventory/store/get-count?populate=true&${params}`,
  INVENTORYGROUP: (params) =>
    `/inventory/get/group-wise?populate=true&${params}`,
  INVENTORYGROUPTOTAL: (params) =>
    `/inventory/get/group-wise/total?populate=true&${params}`,
  EXPORT: "/exportCsv",
  UNIVERSALSEARCH: (params) => `/products/product?search=${params}`,
  UNIVERSALSEARCHGET: (params) => `/inventory/store?${params}`,
  STOCKTRANSFER: (params) => `/stockTransfer?populate=true&${params}`,
  SALEINOUT: (params) => `/stockSale?populate=true&${params}`,
  ADJUSTMENT: (params) => `/stockAdjustment?populate=true&${params}`,
  STOCKADJUSTMENT: (params) => `/inventory?${params}`,
  ADDSTOCKADJUSTMENT: `/stockAdjustment`,
  BULK_UPLOAD: "/products/upload/bulk-upload-3",
  UPDATE_INVENTORY: "/inventory/updateInventoryData",
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

const buildProductStoreParams = (productIds, page, limit, populate) => {
  const params = new URLSearchParams();

  if (page) params.append("page", page);

  if (limit) {
    params.append("limit", limit);
  }

  if(populate){
    params.append("populate",populate);
  }
  // Store IDs
  productIds.forEach((productIds, index) => {
    params.append(`product._id[$in][${index}]`, productIds);
  });

  return params.toString();
};

const buildAdjustmentParams = (productId, storeIds, page, search, limit) => {
  const params = new URLSearchParams();

  if (page) params.append("page", page);

  if (search) {
    params.append("search[search]", search);
  }
  if (limit) {
    params.append("limit", limit);
  }

  // productId.forEach((productId, index) => {

  if (productId) {
    params.append(`optimize[product][$in][0]`, productId);
  }
  // });

  // Store IDs
  storeIds.forEach((storeId, index) => {
    params.append(`optimize[store][$in][${index}]`, storeId);
  });

  return params.toString();
};

const buildStockAdjustmentParams = (productId, storeIds) => {
  const params = new URLSearchParams();

  if (productId) {
    params.append(`product._id`, productId);
  }
  // });

  // Store IDs
  if (storeIds) {
    params.append(`storesArr[0]`, storeIds);
  }

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
  getInventoryGetCount: async (
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
        INVENTORY_ENDPOINTS.INVENTORYGETCOUNT(params)
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

  getProductStore: async (productIds = [], page, limit, populate) => {
    try {
      let params = buildProductStoreParams(productIds, page, limit, populate);
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

  getGroupStoreTotal: async (brandIds = [], storeIds = [], page, search, limit) => {
    try {
      let params = buildGroupStoreParams(
        brandIds,
        storeIds,
        page,
        search,
        limit
      );
      const response = await api.get(
        INVENTORY_ENDPOINTS.INVENTORYGROUPTOTAL(params)
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
      return {
        success: false,
        message: error.response?.data?.message || "Error",
      };
    }
  },

  getAdjustment: async (productIds, storeIds = [], page, search, limit) => {
    try {
      let params = buildAdjustmentParams(
        productIds,
        storeIds,
        page,
        search,
        limit
      );
      const response = await api.get(INVENTORY_ENDPOINTS.ADJUSTMENT(params));

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

  getStockAdjustment: async (productIds, storeIds) => {
    try {
      let params = buildStockAdjustmentParams(productIds, storeIds);

      const response = await api.get(
        INVENTORY_ENDPOINTS.STOCKADJUSTMENT(params)
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

  addStockUpdate: async (data) => {
    try {
      const response = await api.post(
        INVENTORY_ENDPOINTS.ADDSTOCKADJUSTMENT,
        data
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
  bulkUpload: async (storeId, file) => {
    try {
      const formData = new FormData();
      formData.append("store", storeId);
      formData.append("bulkUploadFile", file);

      const response = await api.post(
        INVENTORY_ENDPOINTS.BULK_UPLOAD,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error uploading file",
      };
    }
  },

  updateInventoryData: async (data) => {
    try {
      const response = await api.post(
        INVENTORY_ENDPOINTS.UPDATE_INVENTORY,
        data
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error updating inventory",
      };
    }
  },
};
