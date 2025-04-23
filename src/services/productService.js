import api from "./api";

// Print the base URL for debugging
console.log("Product API Base URL:", api.defaults.baseURL);

const PRODUCT_ENDPOINTS = {
eyeGlasses : "/products/eyeGlasses",
eyeGlassesById :(id) =>`/products/eyeGlasses/${id}`,
};


// Product service functions
export const productService = {
  // Add a new eyeGlasses product
  addEyeGlasses: async (productData) => {
    try {
      console.log("Adding new eyeGlasses product:", productData);
      
      // Process photos - remove "/public/" prefix if present
      let processedPhotos = [];
      if (productData.photos) {
        if (Array.isArray(productData.photos)) {
          processedPhotos = productData.photos.map(photo => photo.replace('/public/', ''));
        } else if (typeof productData.photos === 'string') {
          processedPhotos = [productData.photos.replace('/public/', '')];
        }
      }
      
      // Process seoImage - handle string or file object
      let seoImagePath = '';
      if (productData.seoImage) {
        if (typeof productData.seoImage === 'string') {
          seoImagePath = productData.seoImage;
        } else if (productData.seoImage.name) {
          // If it's a file object from the form, construct a path similar to the working example
          seoImagePath = `eyesdeal/website/image/seo/${productData.seoImage.name}`;
        }
      }
      
      // Format the data according to the API requirements
      const formattedData = {
        model: productData.model || "eyeGlasses",
        incentiveAmount: parseFloat(productData.incentiveAmount) || 0,
        brand: productData.brand,
        oldBarcode: productData.oldBarcode,
        HSNCode: productData.HSNCode || "9003",
        sku: productData.sku,
        displayName: productData.displayName,
        unit: productData.unit,
        warranty: productData.warranty,
        description: productData.description,
        tax: parseFloat(productData.tax) || 0,
        costPrice: parseFloat(productData.costPrice) || 0,
        resellerPrice: parseFloat(productData.resellerPrice) || 0,
        MRP: productData.MRP,
        discount: productData.discount,
        sellPrice: parseFloat(productData.sellPrice) || 0,
        manageStock: productData.manageStock === undefined ? true : productData.manageStock,
        inclusiveTax: productData.inclusiveTax === undefined ? true : productData.inclusiveTax,
        modelNumber: productData.modelNumber,
        colorNumber: productData.colorNumber,
        frameType: productData.frameType,
        frameShape: productData.frameShape,
        frameStyle: productData.frameStyle,
        templeMaterial: productData.templeMaterial,
        frameMaterial: productData.frameMaterial,
        templeColor: productData.templeColor,
        frameColor: productData.frameColor,
        prescriptionType: productData.prescriptionType,
        frameCollection: productData.frameCollection,
        features: Array.isArray(productData.features) ? productData.features : [productData.features].filter(Boolean),
        gender: productData.gender,
        frameSize: productData.frameSize,
        frameWidth: productData.frameWidth,
        frameDimensions: productData.frameDimensions,
        weight: productData.weight,
        activeInWebsite: productData.activeInWebsite === undefined ? false : productData.activeInWebsite,
        activeInERP: productData.activeInERP === undefined ? true : productData.activeInERP,
        seoTitle: productData.seoTitle,
        seoDescription: productData.seoDescription,
        seoImage: seoImagePath,
        photos: processedPhotos,
      };
      
    
      
      const response = await api.post(PRODUCT_ENDPOINTS.eyeGlasses, formattedData);
      
      // Handle response structure
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || "Product added successfully",
        };
      }
      
      return {
        success: false,
        message: response.data?.message || "Error adding product",
      };
    } catch (error) {
      console.error("Error adding eyeGlasses product:", error);
      
      let errorMessage = "Error adding product";
      
      // Handle different error types
      if (error.response) {
        console.error("Server error response:", error.response.data);
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        console.error("No response received:", error.request);
        errorMessage = "No response from server";
      } else {
        console.error("Request error:", error.message);
        errorMessage = `Request error: ${error.message}`;
      }
      
      return {
        success: false,
        message: errorMessage,
        error: error.toString(),
      };
    }
  },
  
  // Get all eyeGlasses products
  getEyeGlasses: async () => {
    try {
      const response = await api.get(PRODUCT_ENDPOINTS.eyeGlasses);
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
        };
      }
      
      return {
        success: false,
        message: response.data?.message || "Error fetching products",
      };
    } catch (error) {
      console.error("Error fetching eyeGlasses products:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Error fetching products",
      };
    }
  },
  
  // Get a single eyeGlasses product by ID
  getEyeGlassesById: async (id) => {
    try {
      const response = await api.get(PRODUCT_ENDPOINTS.eyeGlassesById(id));
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
        };
      }
      
      return {
        success: false,
        message: response.data?.message || "Error fetching product",
      };
    } catch (error) {
      console.error(`Error fetching eyeGlasses product with ID ${id}:`, error);
      return {
        success: false,
        message: error.response?.data?.message || "Error fetching product",
      };
    }
  },
  
  // Update an eyeGlasses product
  updateEyeGlasses: async (id, productData) => {
    try {
      const response = await api.put(PRODUCT_ENDPOINTS.eyeGlassesById(id), productData);
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || "Product updated successfully",
        };
      }
      
      return {
        success: false,
        message: response.data?.message || "Error updating product",
      };
    } catch (error) {
      console.error(`Error updating eyeGlasses product with ID ${id}:`, error);
      return {
        success: false,
        message: error.response?.data?.message || "Error updating product",
      };
    }
  },
  
  // Delete an eyeGlasses product
  deleteEyeGlasses: async (id) => {
    try {
      const response = await api.delete(PRODUCT_ENDPOINTS.eyeGlassesById(id));
      
      if (response.data && response.data.success) {
        return {
          success: true,
          message: response.data.message || "Product deleted successfully",
        };
      }
      
      return {
        success: false,
        message: response.data?.message || "Error deleting product",
      };
    } catch (error) {
      console.error(`Error deleting eyeGlasses product with ID ${id}:`, error);
      return {
        success: false,
        message: error.response?.data?.message || "Error deleting product",
      };
    }
  }
}; 