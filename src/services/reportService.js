import api from "./api";

// Auth endpoints
const REPORTS_ENDPOINTS = {
  STORES: `/stores`,
  BRAND: `/master/brand`,
  CATEGORY: `/expenseCategory`,
  ORDERS: `/orders`,
  GET_AMOUNT: `/report/get-amount`,
  PURCHASELOG: `/inventory/purchase/purchaseLog`,
  SALES: `/sales`,
  JOBWORKS: `/jobWorks`,
  GET_EMPLOYEE: `/user/list`,
  GET_INCENTIVE_AMOUNT: `/report/incentiveReport/get-incentive-amount`,
  CASH_BOOK: `/cashbook/`,
  TRANSFER_STOCK: `/report/transfer/stock`,
  STOCKADJUSTMENT: `/stockAdjustment`,
  PRODUCT_INVENTORY: `/report/productInventory/stock`,
  EXPORT: `/exportCsv`,
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
          populate: true,
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
  fetchOrders: async ({
    page,
    fromDate,
    limit = 100,
    toDate,
    search,
    stores = [],
    brands = [],
  }) => {
    try {
      const params = {
        populate: true,
      };

      if (page) params.page = page;
      if (limit) params.limit = limit;

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
  exportCsv: async (data) => {
    try {
      const response = await api.post(REPORTS_ENDPOINTS.EXPORT, data);
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
  getAmount: async ({
    search,
    fromDate,
    toDate,
    stores = [],
    brands = [],
    vendors = [],
    page,
  }) => {
    try {
      const params = {
        populate: true,
        search,
      };

      if (page) params.page = page;
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

      // Brands (applied on both product and lens)
      if (vendors.length) {
        vendors.forEach((brandId, index) => {
          const id = brandId;
          params[`optimize[vendor][$in][${index}]`] = id;
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
  getSalesData: async ({ search, page, fromDate, toDate, stores = [] }) => {
    try {
      const params = {
        populate: true,
        search,
      };

      if (page) params.page = page;
      if (fromDate) params["createdAt[$gte]"] = fromDate;
      if (toDate) params["createdAt[$lte]"] = toDate;

      // Stores
      if (stores.length) {
        stores.forEach((storeId, index) => {
          params[`optimize[store][$in][${index}]`] = storeId;
        });
      }

      const response = await api.get(REPORTS_ENDPOINTS.SALES, { params });
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
  getJobWorksData: async ({
    search,
    page,
    fromDate,
    toDate,
    status = [],
    stores = [],
    vendor = [],
  }) => {
    try {
      const params = {
        populate: true,
      };

      if (page) params.page = page;
      if (search) params.search = search;
      if (fromDate) params["createdAt[$gte]"] = fromDate;
      if (toDate) params["createdAt[$lte]"] = toDate;

      // Status
      if (status.length) {
        status.forEach((statusname, index) => {
          params[`optimize[status][$in][${index}]`] = statusname;
        });
      }

      // Stores
      if (stores.length) {
        stores.forEach((storeId, index) => {
          params[`optimize[store][$in][${index}]`] = storeId;
        });
      }

      // Vendors
      if (vendor.length) {
        vendor.forEach((vendorId, index) => {
          params[`optimize[vendor][$in][${index}]`] = vendorId;
        });
      }

      const response = await api.get(REPORTS_ENDPOINTS.JOBWORKS, { params });
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
  getEmployeeData: async ({ role = [], limit }) => {
    try {
      const params = {
        populate: true,
      };

      if (limit) params.limit = limit;

      // Role
      if (role.length) {
        role.forEach((rolename, index) => {
          params[`role[$in][${index}]`] = rolename;
        });
      }

      const response = await api.get(REPORTS_ENDPOINTS.GET_EMPLOYEE, {
        params,
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
  getIncentiveData: async ({ search, fromDate, toDate, salesRep }) => {
    try {
      const params = {
        search,
        populate: true,
      };

      if (!search) {
        params["$or[0][product.incentiveAmount][$gt]"] = 0;
        params["$or[1][lens.incentiveAmount][$gt]"] = 0;
      }

      if (fromDate) params["createdAt[$gte]"] = fromDate;
      if (toDate) params["createdAt[$lte]"] = toDate;

      // salesRep
      if (salesRep) {
        params[`sale.salesRep[$in][0]`] = salesRep;
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
  getIncentiveAmount: async ({ search, fromDate, toDate, salesRep }) => {
    try {
      const params = {
        populate: true,
        search,
      };

      if (fromDate) params["createdAt[$gte]"] = fromDate;
      if (toDate) params["createdAt[$lte]"] = toDate;

      // salesRep
      if (salesRep) {
        params[`sale.salesRep[$in][0]`] = salesRep;
      }

      const response = await api.get(REPORTS_ENDPOINTS.GET_INCENTIVE_AMOUNT, {
        params,
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
  getCashbook: async ({
    fromDate,
    toDate,
    limit,
    type = [],
    mode = [],
    stores = [],
  }) => {
    try {
      const requests = mode.map(async (modeValue) => {
        const params = {
          populate: true,
        };

        if (limit) params.limit = limit;
        if (fromDate) params["createdAt[$gte]"] = fromDate;
        if (toDate) params["createdAt[$lte]"] = toDate;

        if (type.length) {
          type.forEach((typename, index) => {
            params[`optimize[type][$in][${index}]`] = typename;
          });
        }

        // Stores
        if (stores.length) {
          stores.forEach((storeId, index) => {
            params[`optimize[store][$in][${index}]`] = storeId;
          });
        }

        const endpoint = `/cashbook/${modeValue}`;

        return api.get(endpoint, { params }).then((response) => ({
          mode: modeValue,
          data: response.data,
        }));
      });

      const results = await Promise.all(requests);
      return {
        success: true,
        data: results,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error",
      };
    }
  },
  getTransferStock: async ({
    page,
    search,
    fromDate,
    toDate,
    storeFrom = [],
    storeTo = [],
    storeFromid,
    storeToid,
  }) => {
    try {
      const params = {
        populate: true,
        search,
      };

      if (page) params.page = page;
      if (fromDate) params["createdAt[$gte]"] = fromDate;
      if (toDate) params["createdAt[$lte]"] = toDate;

      if (storeFrom) {
        params[`optimize[from][$in][0]`] = storeFrom?.[0];
      }

      if (storeTo) {
        params[`optimize[to][$in][0]`] = storeTo?.[0];
      }

      if (storeFromid) {
        params[`optimize[from][$in][0]`] = storeFromid;
      }

      if (storeToid) {
        params[`optimize[to][$in][0]`] = storeToid;
      }

      const response = await api.get(REPORTS_ENDPOINTS.TRANSFER_STOCK, {
        params,
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
  getStockReport: async ({
    search,
    fromDate,
    toDate,
    stores = [],
    storesids = [],
  }) => {
    try {
      const params = {
        populate: true,
        search,
      };

      if (fromDate) params["createdAt[$gte]"] = fromDate;
      if (toDate) params["createdAt[$lte]"] = toDate;

      // Stores
      if (stores.length) {
        stores.forEach((storeId, index) => {
          params[`optimize[store][$in][${index}]`] = storeId;
        });
      }

      // Stores
      if (storesids.length) {
        storesids.forEach((storesid, index) => {
          params[`optimize[store][$in][${index}]`] = storesid.value;
        });
      }

      const response = await api.get(REPORTS_ENDPOINTS.STOCKADJUSTMENT, {
        params,
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
  fetchInventoryReport: async ({ page, manageStock, search }) => {
    try {
      const params = {
        populate: true,
        limit: 400,
        search,
      };

      if (page) params.page = page;
      if (manageStock) params["product.manageStock"] = manageStock;

      const response = await api.get(REPORTS_ENDPOINTS.PRODUCT_INVENTORY, {
        params,
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
  getPurchaseLog: async ({
    page,
    limit,
    fromDate,
    toDate,
    stores = [],
    vendors = [],
    search,
  }) => {
    try {
      const params = {};

      if (page) params.page = page;
      if (limit) params.limit = limit;

      if (search) params.search = search; // 👈 just send it as-is

      if (fromDate) params["createdAt[$gte]"] = fromDate;
      if (toDate) params["createdAt[$lte]"] = toDate;

      // Stores
      if (stores.length) {
        stores.forEach((storeId, index) => {
          params[`optimize[store][$in][${index}]`] = storeId;
        });
      }

      // Vendors
      if (vendors.length) {
        vendors.forEach((vendorId, index) => {
          params[`optimize[vendor][$in][${index}]`] = vendorId;
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
        message: error.response?.data?.message || "Error At Purchase Log",
      };
    }
  },
};
