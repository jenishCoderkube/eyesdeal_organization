import api from "./api";
// Auth endpoints
const DASHBOARD_ENDPOINTS = {
  DASHBOARD: (stortID) => `dashboard?id=${stortID}`,
};

export const dashBoardService = {
  getDashboard: async () => {
    try {
      const userData = localStorage.getItem("user");
      if (!userData) {
        console.error("User data not found in localStorage");
        return;
      }

      const user = JSON.parse(userData);
      let stortID = user.stores[0];
      const response = await api.get(DASHBOARD_ENDPOINTS.DASHBOARD(stortID));
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error checking user",
      };
    }
  },
};
