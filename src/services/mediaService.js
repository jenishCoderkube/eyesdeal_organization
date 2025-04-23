import { printLogs } from "../utils/constants";
import api from "./api";

// Auth endpoints
const MEDIA_ENDPOINTS = {
  MEDIALIBRARY: (peram) => `/mediaLibrary?currentFolder=${peram}`,
};

// Auth service functions
export const mediaService = {
  getMedia: async (path) => {
    try {
      const response = await api.get(MEDIA_ENDPOINTS.MEDIALIBRARY(path));
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error checking store",
      };
    }
  },
};
