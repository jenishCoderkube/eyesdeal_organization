import api from "./api";

// Auth endpoints
const REPORTS_ENDPOINTS = {
  STORES: `/stores`,
  BRAND: `/master/brand`,
  CATEGORY: `/expenseCategory`,
  ORDERS: `/orders`,
  GET_AMOUNT: `/report/get-amount`,
  PURCHASELOG: `/inventory/purchase/purchaseLog`,
};

// Auth service functions
export const reportService = {
  getStores: async () => {
    try {
      const response = await api.get(REPORTS_ENDPOINTS.STORES);
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
  getBrands: async () => {
    try {
      const response = await api.get(REPORTS_ENDPOINTS.BRAND);
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
      const response = await api.get(REPORTS_ENDPOINTS.CATEGORY);
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
  getOrders: async (page, fromDate, toDate) => {
    try {
      const response = await api.get(REPORTS_ENDPOINTS.ORDERS, {
        params: {
          populate: true,
          page: page,
          "createdAt[$gte]": fromDate ?? "",
          "createdAt[$lte]": toDate ?? "",
        },
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
  getOrdersBySearch: async (search) => {
    try {
      const response = await api.get(REPORTS_ENDPOINTS.ORDERS, {
        params: {
          search,
          populate: true
        },
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
  fetchOrders: async ({ page, fromDate, toDate, search, stores = [], brands = [] }) => {
    try {
      const params = {
        populate: true,
      };

      if (page) params.page = page;
      if (fromDate) params["createdAt[$gte]"] = fromDate;
      if (toDate) params["createdAt[$lte]"] = toDate;
      if (search) params.search = search;

      // Stores
      if (stores.length) {
        stores.forEach((storeId, index) => {
          params[`optimize[store][$in][${index}]`] = storeId;
        });
      }

      // Brands (applied on both product and lens)
      if (brands.length) {
        brands.forEach((brandId, index) => {
          const id = brandId;
          params[`$or[0][product.item.brand._id][$in][${index}]`] = id;
          params[`$or[1][lens.item.brand._id][$in][${index}]`] = id;
        });
      }
      const response = await api.get(REPORTS_ENDPOINTS.ORDERS, { params });

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
  getAmount: async ({ fromDate, toDate, stores = [], brands = [] }) => {
    try {
      const params = {
        populate: true,
      };

      if (fromDate) params["createdAt[$gte]"] = fromDate;
      if (toDate) params["createdAt[$lte]"] = toDate;

      // Stores
      if (stores.length) {
        stores.forEach((storeId, index) => {
          params[`optimize[store][$in][${index}]`] = storeId;
        });
      }

      // Brands (applied on both product and lens)
      if (brands.length) {
        brands.forEach((brandId, index) => {
          const id = brandId;
          params[`$or[0][product.item.brand._id][$in][${index}]`] = id;
          params[`$or[1][lens.item.brand._id][$in][${index}]`] = id;
        });
      }

      const response = await api.get(REPORTS_ENDPOINTS.GET_AMOUNT, { params });
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
  getAmountBySearch: async (fromDate, toDate, search) => {
    try {
      const response = await api.get(REPORTS_ENDPOINTS.GET_AMOUNT, {
        params: {
          populate: true,
          search,
          "createdAt[$gte]": fromDate ?? "",
          "createdAt[$lte]": toDate ?? "",
        },
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
  getPurchaseLog: async ({ page, fromDate, toDate, stores = [], vendors = [] }) => {
    try {
      const params = {
        populate: true,
      };

      if (fromDate) params["createdAt[$gte]"] = fromDate;
      if (toDate) params["createdAt[$lte]"] = toDate;

      // Stores
      if (stores.length) {
        stores.forEach((storeId, index) => {
          params[`optimize[store][$in][${index}]`] = storeId;
        });
      }

      // Brands (applied on both product and lens)
      if (vendors.length) {
        vendors.forEach((brandId, index) => {
          const id = brandId;
          params[`optimize[vendor][$in][${index}]`] = id;
        });
      }

      const response = await api.get(REPORTS_ENDPOINTS.PURCHASELOG, { params });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error At Purchase Log",
      };
    }
  },
  getPurchaseLogByPage: async (fromDate, toDate) => {
    try {
      const response = await api.get(REPORTS_ENDPOINTS.PURCHASELOG, {
        params: {
          page: 1,
          "createdAt[$gte]": fromDate ?? "",
          "createdAt[$lte]": toDate ?? "",
        },
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error At Purchase Log",
      };
    }
  },
  getPurchaseLogBySearch: async (search) => {
    try {
      const response = await api.get(REPORTS_ENDPOINTS.PURCHASELOG, {
        params: {
          search
        },
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error At Purchase Log",
      };
    }
  },
};
