import api from "./api";

// Sale endpoints
const USER_ENDPOINTS = {
    ADD_ORGANIZATION: "/organization",
    ADD_CUSTOMER: "/user/register",
    ADD_EMPLOYEE: "/user/register",
    GET_STORES: "/stores",
    GET_EMPLOYEES: "/user/list",
    GET_EMPLOYEE_BY_ID: "/user/list",
};

// sale service functions
export const userService = {
    addOrganization: async (data) => {
        try {
            const response = await api.post(USER_ENDPOINTS.ADD_ORGANIZATION, data);

            return {
                success: true,
                data: response.data,
                message: "Organization added successfully."
            }
        } catch (error){
            return {
                success: false,
                message: error?.response?.data?.message || "Error adding organization"
            }
        }
    },

    addCustomer: async (data) => {
        try {
            const response = await api.post(USER_ENDPOINTS.ADD_CUSTOMER, data);
            return {
                success: true,
                data: response.data,
                message: "Customer added successfully."
            }
        } catch (error) {
            return {
                success: false,
                message: error?.response?.data?.message || "Error adding customer"
            }
        }
    },

    addEmployee: async (data) => {
        try {
            const response = await api.post(USER_ENDPOINTS.ADD_EMPLOYEE, data);
            return {
                success: true,
                data: response.data,
                message: "Employee added successfully."
            }
        } catch (error) {
            return {
                success: false,
                message: error?.response?.data?.message || "Error adding employee"
            }
        }
    },
    getStores: async () => {
        try {
            const response = await api.get(USER_ENDPOINTS.GET_STORES);
            return {
                success: true,
                data: response.data,
            }
        } catch (error) {
            return {
                success: false,
                message: error?.response?.data?.message || "Error fetching stores!"
            }
        }
    },
    getEmployees: async (page) => {
        try {
            const response = await api.get(USER_ENDPOINTS.GET_EMPLOYEES, {
                params: {
                    "role[$ne]": "customer",
                    populate: true,
                    page: page,
                    limit: 300
                }
            });
            return {
                success: true,
                data: response.data,
            }
        } catch (error) {
            return {
                success: false,
                message: error?.response?.data?.message || "Error fetching employees!"
            }
        }
    },
    getEmployeeById: async (id) => {
        try {
            const response = await api.get(USER_ENDPOINTS.GET_EMPLOYEES, {
                params: {
                    _id: id
                }
            });
            return {
                success: true,
                data: response.data,
            }
        }
        catch (error) {
            return {
                success: false,
                message: error?.response?.data?.message || "Error fetching employee detail!"
            }
        }
    }
};
