import api from "./api";

// Sale endpoints
const SALE_ENDPOINTS = {
    LIST_USERS: "/user/list",
    SALES: "/sales",
    MARKETINGREFERENCES: "/user/marketingReferences",
    LIST_PRODUCT: "/products/product",
    CHECK_INVENTORY: "/inventory/get-inventory-general",
    GET_STORE: "/stores",
    COUPON: "/coupon/private",
};

// sale service functions
export const saleService = {
    listUsers: async (search = "") => {
        try {
            const params = {
                search,
                role: "customer",
                populate: true,
            };
            const response = await api.get(SALE_ENDPOINTS.LIST_USERS, { params });
            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || "Error fetching customers",
            };
        }
    },
    sales: async (customerId = "") => {
        try {
            const params = {
                customerId,
                populate: true,
                limit: 50,
                page: 1
            };

            const response = await api.get(SALE_ENDPOINTS.SALES, { params });

            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || "Error fetching customer's sales data",
            };
        }
    },
    getUser: async (_id = "") => {
        try {
            const params = {
                _id,
                populate: true,
            };

            const response = await api.get(SALE_ENDPOINTS.LIST_USERS, { params });

            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || "Error fetching user data",
            };
        }
    },
    getMarketingReferences: async () => {
        try {
            const response = await api.get(SALE_ENDPOINTS.MARKETINGREFERENCES);
            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || "Error fetching user data",
            };
        }
    },
    listProducts: async (search = "") => {
        try {
            const params = {
                search,
            };
            const response = await api.get(SALE_ENDPOINTS.LIST_PRODUCT, { params });
            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || "Error fetching product data",
            };
        }
    },
    checkInventory: async (optimizeProdId, optimizeStoreId = "") => {
        try {
            const params = {
                "optimize[product]": optimizeProdId,
                "optimize[store]": optimizeStoreId,
                limit: 5,
                populate: true
            };
            const response = await api.get(SALE_ENDPOINTS.CHECK_INVENTORY, { params });
            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || "Error fetching product data",
            };
        }
    },
    getSalesRep: async (storeId) => {        
        try {
            const params = {
                "role[$in][0]": "sales",
                "role[$in][1]": "store_manager",
                "role[$in][2]": "individual_store",
                stores: storeId,
                isActive: true
            };
            const response = await api.get(SALE_ENDPOINTS.LIST_USERS, { params });
            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || "Error fetching salesRep data",
            };
        }
    },
    getLensData: async (search) => {        
        try {
            const params = {
                search,
                "__t[$in][0]": "spectacleLens",
                "__t[$in][1]": "contactLens",
            };
            const response = await api.get(SALE_ENDPOINTS.LIST_PRODUCT, { params });
            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || "Error fetching lens data",
            };
        }
    },
    checkCouponCode: async (coupon, customerPhone, products) => {        
        try {
            const params = {
                couponCode: coupon,
                phone: customerPhone,
                products: products,
              };
            const response = await api.post(SALE_ENDPOINTS.COUPON, { params });
            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || "Error at Cheking CouponCode",
            };
        }
    },
};
