import api from "./api";

// Print the base URL for debugging
console.log("Product API Base URL:", api.defaults.baseURL);

const PRODUCT_ENDPOINTS = {
  SUNGLASSES: "/products/sunGlasses",
  SPECTACLELENS: "/products/spectacleLens",
  EYEGLASSES: "/products/eyeGlasses",
  EYEGLASSES_BY_ID: (id) => `/products/eyeGlasses/${id}`,
  ACCESSORIES: "/products/accessories",
  ACCESSORIES_BY_ID: (id) => `/products/accessories/${id}`,
  CONTACTLENS: "/products/contactLens",
  CONTACTLENS_BY_ID: (id) => `/products/contactLens/${id}`,
  READINGGLASSES: "/products/readingGlasses",
  READINGGLASSES_BY_ID: (id) => `/products/readingGlasses/${id}`,
  CONTACTSOLUTIONS: "/products/contactSolutions",
  CONTACTSOLUTIONS_BY_ID: (id) => `/products/contactSolutions/${id}`,
};

// Generic function to handle API requests
const handleApiRequest = async (requestType, endpoint, data = null) => {
  try {
    let response;
    if (requestType === 'GET') {
      response = await api.get(endpoint);
    } else if (requestType === 'POST') {
      response = await api.post(endpoint, data);
    } else if (requestType === 'PUT') {
      response = await api.put(endpoint, data);
    } else if (requestType === 'DELETE') {
      response = await api.delete(endpoint);
    }

    if (response.data && response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || "Operation successful",
      };
    }

    return {
      success: false,
      message: response.data?.message || "Error during operation",
    };
  } catch (error) {
    console.error(`Error during ${requestType} request:`, error);
    return {
      success: false,
      message: error.response?.data?.message || "Error during operation",
    };
  }
};

// Product service functions
export const productService = {
  // Add a new product
  addProduct: async (productData, productType) => {
    console.log(`Adding new ${productType} product:`, productData);
    
    const endpoint = PRODUCT_ENDPOINTS[productType.toUpperCase()] || PRODUCT_ENDPOINTS.ACCESSORIES;

    // Process photos and seoImage as before
    let processedPhotos = [];
    if (productData.photos) {
      if (Array.isArray(productData.photos)) {
        processedPhotos = productData.photos.map(photo => photo.replace('/public/', ''));
      } else if (typeof productData.photos === 'string') {
        processedPhotos = [productData.photos.replace('/public/', '')];
      }
    }

    let seoImagePath = '';
    if (productData.seoImage) {
      if (typeof productData.seoImage === 'string') {
        seoImagePath = productData.seoImage;
      } else if (productData.seoImage.name) {
        seoImagePath = `eyesdeal/website/image/seo/${productData.seoImage.name}`;
      }
    }

    const formattedData = {
      model: productData.model || "accessories",
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
      expiryDate: productData.expiryDate,
      manufactureDate: productData.manufactureDate,
    };

    return await handleApiRequest('POST', endpoint, formattedData);
  },

  // Get all products
  getProducts: async (productType) => {
    const endpoint = PRODUCT_ENDPOINTS[productType.toUpperCase()];
    return await handleApiRequest('GET', endpoint);
  },

  // Get a single product by ID
  getProductById: async (productType, id) => {
    const endpoint = PRODUCT_ENDPOINTS[`${productType.toUpperCase()}_BY_ID`](id);
    return await handleApiRequest('GET', endpoint);
  },

  // Update a product
  updateProduct: async (productType, id, productData) => {
    const endpoint = PRODUCT_ENDPOINTS[`${productType.toUpperCase()}_BY_ID`](id);
    return await handleApiRequest('PUT', endpoint, productData);
  },

  // Delete a product
  deleteProduct: async (productType, id) => {
    const endpoint = PRODUCT_ENDPOINTS[`${productType.toUpperCase()}_BY_ID`](id);
    return await handleApiRequest('DELETE', endpoint);
  },
}; 