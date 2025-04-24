import api from "./api";

// Print the base URL for debugging
console.log("API Base URL:", api.defaults.baseURL);

// Product attribute endpoints mapping
// The key is the UPPERCASE version of the attribute type WITHOUT underscores
// The value is the actual API endpoint path
const ATTRIBUTE_ENDPOINTS = {
  BRAND: "/master/brand",
  COLLECTION: "/master/collection",
  FEATURE: "/master/feature",
  COLOR: "/master/color",
  FRAMESTYLE: "/master/frameStyle",
  FRAMETYPE: "/master/frameType",
  UNIT: "/master/unit",
  FRAMESHAPE: "/master/frameShape",
  MATERIAL: "/master/material",
  READINGPOWER: "/master/readingPower",
  PRESCRIPTIONTYPE: "/master/prescriptionType",
  SUBCATEGORY: "/master/subCategory",
  LENSTECHNOLOGY: "/master/lensTechnology",
  DISPOSABILITY: "/master/disposability",
};

// Print all available endpoints for debugging
console.log("Available attribute endpoints:", ATTRIBUTE_ENDPOINTS);

// Product attribute service functions
export const productAttributeService = {
  // Generic function to fetch any type of attribute
  getAttributes: async (attributeType) => {
    try {
      console.log("Getting attributes for type:", attributeType);
      
      // Convert to uppercase and remove any spaces or non-alphanumeric characters
      // This handles camelCase like frameStyle -> FRAMESTYLE
      const endpointKey = attributeType.toUpperCase().replace(/[^A-Z0-9]/g, '');
      console.log("Endpoint key:", endpointKey);
      
      const endpoint = ATTRIBUTE_ENDPOINTS[endpointKey];
      if (!endpoint) {
        console.error(`Invalid attribute type: ${attributeType}, endpoint key: ${endpointKey}`);
        console.error("Available endpoint keys:", Object.keys(ATTRIBUTE_ENDPOINTS));
        throw new Error(`Invalid attribute type: ${attributeType}`);
      }
      
      const apiUrl = endpoint;
      console.log(`Fetching ${attributeType} from endpoint:`, apiUrl);
      
      const response = await api.get(apiUrl);
      console.log(`${attributeType} response:`, response);
      
      // Handle nested response structure
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
        };
      }
      
      return {
        success: false,
        message: response.data?.message || `Error fetching ${attributeType}`,
      };
    } catch (error) {
      console.error(`Error fetching ${attributeType}:`, error);
      return {
        success: false,
        message: error.response?.data?.message || `Error fetching ${attributeType}`,
      };
    }
  },
  
  // Update an attribute
  updateAttribute: async (attributeType, id, data) => {
    try {
      // Convert to uppercase and remove any spaces or non-alphanumeric characters
      const endpointKey = attributeType.toUpperCase().replace(/[^A-Z0-9]/g, '');
      console.log(`Update operation - Attribute type: ${attributeType}, Endpoint key: ${endpointKey}`);
      
      const endpoint = ATTRIBUTE_ENDPOINTS[endpointKey];
      if (!endpoint) {
        console.error(`Invalid attribute type: ${attributeType}, endpoint key: ${endpointKey}`);
        console.error("Available endpoint keys:", Object.keys(ATTRIBUTE_ENDPOINTS));
        throw new Error(`Invalid attribute type: ${attributeType}`);
      }
      
      // Prepare the update data - use the full object with _id for PATCH
      const updateData = {
        _id: id,
        ...data
      };
      
      const apiUrl = endpoint;
      console.log(`Updating ${attributeType} with URL: ${apiUrl}`);
      console.log(`Update data:`, updateData);
      
      // Use PATCH instead of PUT as per the curl example
      const response = await api.patch(apiUrl, updateData);
      console.log(`Update response for ${attributeType}:`, response.data);
      
      // Handle nested response structure
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
        };
      }
      
      return {
        success: false,
        message: response.data?.message || `Error updating ${attributeType}`,
      };
    } catch (error) {
      console.error(`Error updating ${attributeType}:`, error);
      return {
        success: false,
        message: error.response?.data?.message || `Error updating ${attributeType}`,
      };
    }
  },
  
  // Delete an attribute
  deleteAttribute: async (attributeType, id) => {
    try {
      // Convert to uppercase and remove any spaces or non-alphanumeric characters
      const endpointKey = attributeType.toUpperCase().replace(/[^A-Z0-9]/g, '');
      console.log(`Delete operation - Attribute type: ${attributeType}, Endpoint key: ${endpointKey}`);
      
      const endpoint = ATTRIBUTE_ENDPOINTS[endpointKey];
      if (!endpoint) {
        console.error(`Invalid attribute type: ${attributeType}, endpoint key: ${endpointKey}`);
        console.error("Available endpoint keys:", Object.keys(ATTRIBUTE_ENDPOINTS));
        return {
          success: false,
          message: `Invalid attribute type: ${attributeType}`
        };
      }
      
      if (!id) {
        console.error(`Delete operation failed: No ID provided for ${attributeType}`);
        return {
          success: false,
          message: `No ID provided for deletion`
        };
      }
      
      const deleteUrl = `${endpoint}/${id}`;
      console.log(`Deleting ${attributeType} with id: ${id}`);
      console.log(`Full delete URL: ${api.defaults.baseURL}${deleteUrl}`);
      
      // Use DELETE with ID in the path, matching the curl example
      const response = await api.delete(deleteUrl);
      console.log(`Delete response for ${attributeType}:`, response.data);
      
      // Handle nested response structure
      if (response.data && response.data.success) {
        // Always force a new fetch of the data to ensure it's fresh
        console.log(`Forcing refresh for ${attributeType} after deletion`);
        const refreshedData = await productAttributeService.getAttributes(attributeType);
        
        return {
          success: true,
          data: response.data.data, // The deleted item details
          message: response.data.message || `${attributeType} deleted successfully`,
          // Always include the updatedList with fresh data
          updatedList: refreshedData.success ? refreshedData.data : []
        };
      }
      
      return {
        success: false,
        message: response.data?.message || `Error deleting ${attributeType}`,
      };
    } catch (error) {
      console.error(`Error deleting ${attributeType}:`, error);
      let errorMessage = `Error deleting ${attributeType}`;
      
      // Check for different types of errors
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error(`Server responded with error status: ${error.response.status}`);
        console.error(`Error response data:`, error.response.data);
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        // The request was made but no response was received
        console.error(`No response received from server:`, error.request);
        errorMessage = `No response from server`;
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error(`Error setting up request:`, error.message);
        errorMessage = `Request error: ${error.message}`;
      }
      
      return {
        success: false,
        message: errorMessage,
        error: error.toString()
      };
    }
  },
  
  // Refresh attribute data after operations
  refreshAttributeData: async (attributeType) => {
    try {
      console.log(`Refreshing ${attributeType} data after operation`);
      return await productAttributeService.getAttributes(attributeType);
    } catch (error) {
      console.error(`Error refreshing ${attributeType} data:`, error);
      return {
        success: false,
        message: `Error refreshing ${attributeType} data`
      };
    }
  }
}; 