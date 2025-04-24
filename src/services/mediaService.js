import { printLogs } from "../utils/constants";
import api from "./api";

// Auth endpoints
const MEDIA_ENDPOINTS = {
  MEDIALIBRARY: (peram) => `/mediaLibrary?currentFolder=${peram}`,
  ADDFOLDER: `/mediaLibrary/addFolder`,
  DELETEASSETS: (peram) => `/mediaLibrary?${peram}`,
  DELETEFOLDER: (peram) => `/mediaLibrary?${peram}`,
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
        message: error.response?.data?.message || "Error ",
      };
    }
  },

  addFolder: async (data) => {
    try {
      const response = await api.post(MEDIA_ENDPOINTS.ADDFOLDER, data);
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

  deleteAssets: async (peram) => {
    try {
      const response = await api.delete(MEDIA_ENDPOINTS.DELETEASSETS(peram));
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
  deleteFolder: async (peram) => {
    try {
      const response = await api.delete(MEDIA_ENDPOINTS.DELETEFOLDER(peram));
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
};
