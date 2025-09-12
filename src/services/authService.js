import api from "./api";

// Auth endpoints
const AUTH_ENDPOINTS = {
  CHECK_USER: (phone) => `/user/check_user/${phone}`,
  LOGIN: "/user/login",
};

// Auth service functions
export const authService = {
  checkUser: async (phone) => {
    try {
      const response = await api.get(AUTH_ENDPOINTS.CHECK_USER(phone));
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error checking user",
      };
    }
  },

  login: async (phone, password) => {
    try {
      const response = await api.post(AUTH_ENDPOINTS.LOGIN, {
        phone,
        password,
        validationMethod: "password",
      });

      if (response.data.success) {
        localStorage.setItem("accessToken", response.data.data.accessToken);
        localStorage.setItem("user", JSON.stringify(response.data.data.user));
        return {
          success: true,
          message: response.data.message,
          data: response.data.data,
        };
      }

      return {
        success: false,
        message: response.data.message || "Login failed",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  },

  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    window.location.href = "/login";
  },
};
