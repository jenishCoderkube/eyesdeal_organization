import React, { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import AssetSelector from "./AssetSelector";
import { productService } from "../../../../services/productService";
import { productAttributeService } from "../../../../services/productAttributeService";
import { toast } from "react-toastify";

// Validation schema using Yup
const validationSchema = Yup.object({
  model: Yup.string().required("Model is required"),
  tax: Yup.number()
    .required("Tax is required")
    .min(0, "Tax cannot be negative"),
  brand: Yup.string().required("Brand is required"),
  sku: Yup.string().required("SKU is required"),
  displayName: Yup.string().required("Display Name is required"),
  HSNCode: Yup.string().required("HSN Code is required"),
  unit: Yup.string().required("Unit is required"),
  costPrice: Yup.number()
    .required("Cost Price is required")
    .min(0, "Cost Price cannot be negative"),
  resellerPrice: Yup.number()
    .required("Reseller Price is required")
    .min(0, "Reseller Price cannot be negative"),
  MRP: Yup.string().required("MRP is required"),
  discount: Yup.string().required("Discount is required"),
  sellPrice: Yup.number()
    .required("Sell Price is required")
    .min(0, "Sell Price cannot be negative"),
  incentiveAmount: Yup.number()
    .required("Incentive Amount is required")
    .min(0, "Incentive Amount cannot be negative"),
  warranty: Yup.string(),
  oldBarcode: Yup.string(),
  seoTitle: Yup.string(),
  seoDescription: Yup.string(),
  seoImage: Yup.string(),
  gender: Yup.string(),
  description: Yup.string(),
  modelNumber: Yup.string(),
  colorNumber: Yup.string(),
  frameCollection: Yup.string(),
  features: Yup.string(),
  frameType: Yup.string(),
  frameShape: Yup.string(),
  frameStyle: Yup.string(),
  templeMaterial: Yup.string(),
  frameMaterial: Yup.string(),
  frameColor: Yup.string(),
  templeColor: Yup.string(),
  prescriptionType: Yup.string(),
  frameSize: Yup.string(),
  frameWidth: Yup.string(),
  frameDimensions: Yup.string(),
  weight: Yup.string(),
  manageStock: Yup.boolean(),
  inclusiveTax: Yup.boolean(),
  activeInERP: Yup.boolean(),
  activeInWebsite: Yup.boolean(),
  photos: Yup.string(),
});

// Gender options don't come from API, so keep this one
const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "unisex", label: "Unisex" },
];

// Frame size options don't come from API, so keep this one
const frameSizeOptions = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
];

function EyeGlasses({ initialData = {}, mode = "add" }) {
  console.log("initialData<<<", mode, initialData);

  // State for toggle sections
  const [showSections, setShowSections] = useState({
    seoDetails: false,
    productDetails: false,
    frameDetails: false,
    additionalDetails: false,
  });
  
  // State for modal and selected image
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(
    initialData?.photos
      ? Array.isArray(initialData.photos)
        ? initialData.photos[0]
        : initialData.photos
      : null
  );
  
  // State for loading
  const [loading, setLoading] = useState(false);
  
  // State for dropdown options from API
  const [attributeOptions, setAttributeOptions] = useState({
    brands: [],
    units: [],
    frameTypes: [],
    frameShapes: [],
    frameStyles: [],
    materials: [],
    colors: [],
    prescriptionTypes: [],
    collections: [],
    features: []
  });

  // Fetch attribute data from API
  useEffect(() => {
    const fetchAttributes = async () => {
      try {
        // Show loading indicator
        setLoading(true);
        
        // Fetch all necessary attributes for the form
        const attributeTypes = [
          "brand", "unit", "frameType", "frameShape", "frameStyle", 
          "material", "color", "prescriptionType", "collection", "feature"
        ];
        
        const attributeData = {};
        
        for (const type of attributeTypes) {
          const response = await productAttributeService.getAttributes(type);
          if (response.success && response.data) {
            attributeData[type] = response.data.map(item => ({
              value: item._id,
              label: item.name
            }));
          } else {
            console.error(`Failed to fetch ${type} data:`, response.message);
          }
        }
        
        setAttributeOptions({
          brands: attributeData.brand || [],
          units: attributeData.unit || [],
          frameTypes: attributeData.frameType || [],
          frameShapes: attributeData.frameShape || [],
          frameStyles: attributeData.frameStyle || [],
          materials: attributeData.material || [],
          colors: attributeData.color || [],
          prescriptionTypes: attributeData.prescriptionType || [],
          collections: attributeData.collection || [],
          features: attributeData.feature || []
        });
        
      } catch (error) {
        console.error("Error fetching attributes:", error);
        toast.error("Failed to load form options");
      } finally {
        setLoading(false);
      }
    };
    
    fetchAttributes();
  }, []);

  // Toggle section visibility
  const toggleSection = (section) => {
    setShowSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Initial form values with optional chaining
  const initialValues = {
    model: initialData?.model || "eyeGlasses",
    tax: initialData?.tax || "",
    brand: initialData?.brand || "",
    sku: initialData?.sku || "",
    displayName: initialData?.displayName || "",
    HSNCode: initialData?.HSNCode || "9003",
    unit: initialData?.unit || "",
    costPrice: initialData?.costPrice || "",
    resellerPrice: initialData?.resellerPrice || "",
    MRP: initialData?.mrp ? String(initialData.mrp) : "",
    discount: initialData?.discount || "",
    sellPrice: initialData?.sellPrice || "",
    incentiveAmount: initialData?.incentiveAmount || 0,
    warranty: initialData?.warranty || "",
    oldBarcode: initialData?.barcode || "",
    seoTitle: initialData?.seoTitle || "",
    seoDescription: initialData?.seoDescription || "",
    seoImage: initialData?.seoImage || null,
    gender: initialData?.gender || "",
    description: initialData?.description || "",
    modelNumber: initialData?.modelNumber || "",
    colorNumber: initialData?.colorNumber || "",
    frameCollection: initialData?.frameCollection || "",
    features: initialData?.features || "",
    frameType: initialData?.frameType || "",
    frameShape: initialData?.frameShape || "",
    frameStyle: initialData?.frameStyle || "",
    templeMaterial: initialData?.templeMaterial || "",
    frameMaterial: initialData?.frameMaterial || "",
    frameColor: initialData?.frameColor || "",
    templeColor: initialData?.templeColor || "",
    prescriptionType: initialData?.prescriptionType || "",
    frameSize: initialData?.frameSize || "",
    frameWidth: initialData?.frameWidth || "",
    frameDimensions: initialData?.frameDimensions || "",
    weight: initialData?.weight || "",
    manageStock: initialData?.manageStock ?? true,
    inclusiveTax: initialData?.inclusiveTax ?? true,
    activeInERP: initialData?.activeInERP ?? true,
    activeInWebsite: initialData?.activeInWebsite ?? false,
    photos: initialData?.photos
      ? Array.isArray(initialData.photos)
        ? initialData.photos[0]
        : initialData.photos
      : "",
  };

  // Handle form submission with API call
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    console.log(`${mode} values:`, values);
    // if (values.prescriptionType === "") {
    //   values.prescriptionType = null; // or omit it from the payload
    // }
    setLoading(true);
    
    try {
      if (mode === "edit") {
        console.log("Editing product ID:", initialData?.id);
        // Call update API
        const response = await productService.updateEyeGlasses(initialData?.id, values);
        
        if (response.success) {
          toast.success("Product updated successfully");
          console.log("Update response:", response.data);
        } else {
          toast.error(response.message || "Failed to update product");
        }
      } else {
        // Format values for API if needed
        const formattedValues = {
          ...values,
          // Ensure these fields are properly formatted
          features: Array.isArray(values.features) ? values.features : [values.features].filter(Boolean),
          photos: Array.isArray(values.photos) ? values.photos : [values.photos].filter(Boolean)
        };
        
        console.log("Formatted API payload:", formattedValues);
        
        // Call add API
        const response = await productService.addEyeGlasses(formattedValues);
        
        if (response.success) {
          toast.success("Product added successfully");
          resetForm();
          console.log("Add response:", response.data);
        } else {
          toast.error(response.message || "Failed to add product");
        }
      }
    } catch (error) {
      console.error("Error in product operation:", error);
      toast.error("An error occurred while processing your request");
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  // Display loading state while fetching options
  if (loading && attributeOptions.brands.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="ms-3">Loading form data...</p>
      </div>
    );
  }

  return (
    <div className="p-0 mt-5">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize={true}
      >
        {({ setFieldValue, values }) => (
          <Form className="d-flex flex-column gap-4">
            {/* Common Fields */}
            <div>
              <label
                className="form-label text-sm font-medium font-weight-600"
                htmlFor="model"
              >
                Model <span className="text-danger">*</span>
              </label>
              <Field
                type="text"
                name="model"
                className="form-control"
                disabled
                readOnly
              />
              <ErrorMessage
                name="model"
                component="div"
                className="text-danger text-sm"
              />
            </div>

            <div>
              <label
                className="form-label font-weight-600 text-sm font-medium"
                htmlFor="tax"
              >
                Tax <span className="text-danger">*</span>
              </label>
              <Field type="number" name="tax" className="form-control" />
              <ErrorMessage
                name="tax"
                component="div"
                className="text-danger text-sm"
              />
            </div>

            <div>
              <label
                className="form-label font-weight-600 text-sm font-medium"
                htmlFor="brand"
              >
                Brand <span className="text-danger">*</span>
              </label>
              <Select
                name="brand"
                options={attributeOptions.brands}
                onChange={(option) =>
                  setFieldValue("brand", option ? option.value : "")
                }
                value={attributeOptions.brands.find(
                  (option) => option.value === values.brand
                )}
                placeholder="Select..."
                classNamePrefix="react-select"
              />
              <ErrorMessage
                name="brand"
                component="div"
                className="text-danger text-sm"
              />
            </div>

            <div>
              <label
                className="form-label font-weight-600 text-sm font-medium"
                htmlFor="sku"
              >
                SKU <span className="text-danger">*</span>
              </label>
              <Field type="text" name="sku" className="form-control" />
              <ErrorMessage
                name="sku"
                component="div"
                className="text-danger text-sm"
              />
            </div>

            <div>
              <label
                className="form-label font-weight-600 text-sm font-medium"
                htmlFor="displayName"
              >
                Display Name <span className="text-danger">*</span>
              </label>
              <Field type="text" name="displayName" className="form-control" />
              <ErrorMessage
                name="displayName"
                component="div"
                className="text-danger text-sm"
              />
            </div>

            <div>
              <label
                className="form-label font-weight-600 text-sm font-medium"
                htmlFor="HSNCode"
              >
                HSN Code <span className="text-danger">*</span>
              </label>
              <Field type="text" name="HSNCode" className="form-control" />
              <ErrorMessage
                name="HSNCode"
                component="div"
                className="text-danger text-sm"
              />
            </div>

            <div>
              <label
                className="form-label font-weight-600 text-sm font-medium"
                htmlFor="unit"
              >
                Unit <span className="text-danger">*</span>
              </label>
              <Select
                name="unit"
                options={attributeOptions.units}
                onChange={(option) =>
                  setFieldValue("unit", option ? option.value : "")
                }
                value={attributeOptions.units.find(
                  (option) => option.value === values.unit
                )}
                placeholder="Select..."
                classNamePrefix="react-select"
              />
              <ErrorMessage
                name="unit"
                component="div"
                className="text-danger text-sm"
              />
            </div>

            <div className="row row-cols-1 row-cols-md-5 g-4">
              <div>
                <label
                  className="form-label font-weight-600 text-sm font-medium"
                  htmlFor="costPrice"
                >
                  Cost Price <span className="text-danger">*</span>
                </label>
                <Field
                  type="number"
                  name="costPrice"
                  className="form-control"
                />
                <ErrorMessage
                  name="costPrice"
                  component="div"
                  className="text-danger text-sm"
                />
              </div>
              <div>
                <label
                  className="form-label font-weight-600 text-sm font-medium"
                  htmlFor="resellerPrice"
                >
                  Reseller Price <span className="text-danger">*</span>
                </label>
                <Field
                  type="number"
                  name="resellerPrice"
                  className="form-control"
                />
                <ErrorMessage
                  name="resellerPrice"
                  component="div"
                  className="text-danger text-sm"
                />
              </div>
              <div>
                <label
                  className="form-label font-weight-600 text-sm font-medium"
                  htmlFor="MRP"
                >
                  MRP <span className="text-danger">*</span>
                </label>
                <Field type="text" name="MRP" className="form-control" />
                <ErrorMessage
                  name="MRP"
                  component="div"
                  className="text-danger text-sm"
                />
              </div>
              <div>
                <label
                  className="form-label font-weight-600 text-sm font-medium"
                  htmlFor="discount"
                >
                  Discount <span className="text-danger">*</span>
                </label>
                <Field type="text" name="discount" className="form-control" />
                <ErrorMessage
                  name="discount"
                  component="div"
                  className="text-danger text-sm"
                />
              </div>
              <div>
                <label
                  className="form-label font-weight-600 text-sm font-medium"
                  htmlFor="sellPrice"
                >
                  Sell Price <span className="text-danger">*</span>
                </label>
                <Field
                  type="number"
                  name="sellPrice"
                  className="form-control"
                />
                <ErrorMessage
                  name="sellPrice"
                  component="div"
                  className="text-danger text-sm"
                />
              </div>
            </div>

            <div>
              <label
                className="form-label font-weight-600 text-sm font-medium"
                htmlFor="incentiveAmount"
              >
                Incentive Amount <span className="text-danger">*</span>
              </label>
              <Field
                type="number"
                name="incentiveAmount"
                className="form-control"
              />
              <ErrorMessage
                name="incentiveAmount"
                component="div"
                className="text-danger text-sm"
              />
            </div>

            <div>
              <label
                className="form-label font-weight-600 text-sm font-medium"
                htmlFor="warranty"
              >
                Warranty
              </label>
              <Field type="text" name="warranty" className="form-control" />
              <ErrorMessage
                name="warranty"
                component="div"
                className="text-danger text-sm"
              />
            </div>

            <div>
              <label
                className="form-label font-weight-600 text-sm font-medium"
                htmlFor="oldBarcode"
              >
                Old Barcode
              </label>
              <Field type="text" name="oldBarcode" className="form-control" />
              <ErrorMessage
                name="oldBarcode"
                component="div"
                className="text-danger text-sm"
              />
            </div>

            {/* Toggle Links */}
            <p
              className="text-decoration-underline pointer mb-0"
              onClick={() => toggleSection("seoDetails")}
            >
              Add Seo Details
            </p>
            {showSections.seoDetails && (
              <div className="d-flex flex-column gap-4">
                <div>
                  <label
                    className="form-label font-weight-600 text-sm font-medium"
                    htmlFor="seoTitle"
                  >
                    Title
                  </label>
                  <Field type="text" name="seoTitle" className="form-control" />
                  <ErrorMessage
                    name="seoTitle"
                    component="div"
                    className="text-danger text-sm"
                  />
                </div>
                <div>
                  <label
                    className="form-label font-weight-600 text-sm font-medium"
                    htmlFor="seoDescription"
                  >
                    Description
                  </label>
                  <Field
                    as="textarea"
                    name="seoDescription"
                    className="form-control"
                    rows="5"
                  />
                  <ErrorMessage
                    name="seoDescription"
                    component="div"
                    className="text-danger text-sm"
                  />
                </div>
                <div>
                  <label
                    className="form-label font-weight-600 text-sm font-medium"
                    htmlFor="seoImage"
                  >
                    SEO Image
                  </label>
                  <input
                    type="file"
                    name="seoImage"
                    className="form-control"
                    onChange={(event) => {
                      const fileName = event.currentTarget.files[0]?.name || '';
                      // Format the path as required by the API
                      const formattedPath = `eyesdeal/website/image/seo/${fileName}`;
                      setFieldValue("seoImage", formattedPath);
                    }}
                  />
                  <small className="form-text text-muted">
                    Selected file will be sent as: eyesdeal/website/image/seo/[filename]
                  </small>
                  <ErrorMessage
                    name="seoImage"
                    component="div"
                    className="text-danger text-sm"
                  />
                </div>
              </div>
            )}

            <p
              className="text-decoration-underline pointer mb-0"
              onClick={() => toggleSection("productDetails")}
            >
              Product Details
            </p>
            {showSections.productDetails && (
              <div className="d-flex flex-column gap-4">
                <div>
                  <label
                    className="form-label font-weight-600 text-sm font-medium"
                    htmlFor="gender"
                  >
                    Gender
                  </label>
                  <Select
                    name="gender"
                    options={genderOptions}
                    onChange={(option) =>
                      setFieldValue("gender", option ? option.value : "")
                    }
                    value={genderOptions.find(
                      (option) => option.value === values.gender
                    )}
                    placeholder="Select..."
                    classNamePrefix="react-select"
                  />
                  <ErrorMessage
                    name="gender"
                    component="div"
                    className="text-danger text-sm"
                  />
                </div>
                <div>
                  <label
                    className="form-label font-weight-600 text-sm font-medium"
                    htmlFor="description"
                  >
                    Description
                  </label>
                  <Field
                    as="textarea"
                    name="description"
                    className="form-control"
                    rows="5"
                  />
                  <ErrorMessage
                    name="description"
                    component="div"
                    className="text-danger text-sm"
                  />
                </div>
                <div>
                  <label
                    className="form-label font-weight-600 text-sm font-medium"
                    htmlFor="modelNumber"
                  >
                    Model Number
                  </label>
                  <Field
                    type="text"
                    name="modelNumber"
                    className="form-control"
                  />
                  <ErrorMessage
                    name="modelNumber"
                    component="div"
                    className="text-danger text-sm"
                  />
                </div>
                <div>
                  <label
                    className="form-label font-weight-600 text-sm font-medium"
                    htmlFor="colorNumber"
                  >
                    Color Number
                  </label>
                  <Field
                    type="text"
                    name="colorNumber"
                    className="form-control"
                  />
                  <ErrorMessage
                    name="colorNumber"
                    component="div"
                    className="text-danger text-sm"
                  />
                </div>
                <div>
                  <label
                    className="form-label font-weight-600 text-sm font-medium"
                    htmlFor="frameCollection"
                  >
                    Frame Collection
                  </label>
                  <Select
                    name="frameCollection"
                    options={attributeOptions.collections}
                    onChange={(option) =>
                      setFieldValue(
                        "frameCollection",
                        option ? option.value : ""
                      )
                    }
                    value={attributeOptions.collections.find(
                      (option) => option.value === values.frameCollection
                    )}
                    placeholder="Select..."
                    classNamePrefix="react-select"
                  />
                  <ErrorMessage
                    name="frameCollection"
                    component="div"
                    className="text-danger text-sm"
                  />
                </div>
                <div>
                  <label
                    className="form-label font-weight-600 text-sm font-medium"
                    htmlFor="features"
                  >
                    Frame Features
                  </label>
                  <Select
                    name="features"
                    options={attributeOptions.features}
                    onChange={(option) =>
                      setFieldValue("features", option ? option.value : "")
                    }
                    value={attributeOptions.features.find(
                      (option) => option.value === values.features
                    )}
                    placeholder="Select..."
                    classNamePrefix="react-select"
                  />
                  <ErrorMessage
                    name="features"
                    component="div"
                    className="text-danger text-sm"
                  />
                </div>
              </div>
            )}

            <p
              className="text-decoration-underline pointer mb-0"
              onClick={() => toggleSection("frameDetails")}
            >
              Frame Details
            </p>
            {showSections.frameDetails && (
              <div className="d-flex flex-column gap-4">
                <div>
                  <label
                    className="form-label font-weight-600 text-sm font-medium"
                    htmlFor="frameType"
                  >
                    Frame Type
                  </label>
                  <Select
                    name="frameType"
                    options={attributeOptions.frameTypes}
                    onChange={(option) =>
                      setFieldValue("frameType", option ? option.value : "")
                    }
                    value={attributeOptions.frameTypes.find(
                      (option) => option.value === values.frameType
                    )}
                    placeholder="Select..."
                    classNamePrefix="react-select"
                  />
                  <ErrorMessage
                    name="frameType"
                    component="div"
                    className="text-danger text-sm"
                  />
                </div>
                <div>
                  <label
                    className="form-label font-weight-600 text-sm font-medium"
                    htmlFor="frameShape"
                  >
                    Frame Shape
                  </label>
                  <Select
                    name="frameShape"
                    options={attributeOptions.frameShapes}
                    onChange={(option) =>
                      setFieldValue("frameShape", option ? option.value : "")
                    }
                    value={attributeOptions.frameShapes.find(
                      (option) => option.value === values.frameShape
                    )}
                    placeholder="Select..."
                    classNamePrefix="react-select"
                  />
                  <ErrorMessage
                    name="frameShape"
                    component="div"
                    className="text-danger text-sm"
                  />
                </div>
                <div>
                  <label
                    className="form-label font-weight-600 text-sm font-medium"
                    htmlFor="frameStyle"
                  >
                    Frame Style
                  </label>
                  <Select
                    name="frameStyle"
                    options={attributeOptions.frameStyles}
                    onChange={(option) =>
                      setFieldValue("frameStyle", option ? option.value : "")
                    }
                    value={attributeOptions.frameStyles.find(
                      (option) => option.value === values.frameStyle
                    )}
                    placeholder="Select..."
                    classNamePrefix="react-select"
                  />
                  <ErrorMessage
                    name="frameStyle"
                    component="div"
                    className="text-danger text-sm"
                  />
                </div>
                <div>
                  <label
                    className="form-label font-weight-600 text-sm font-medium"
                    htmlFor="templeMaterial"
                  >
                    Temple Material
                  </label>
                  <Select
                    name="templeMaterial"
                    options={attributeOptions.materials}
                    onChange={(option) =>
                      setFieldValue(
                        "templeMaterial",
                        option ? option.value : ""
                      )
                    }
                    value={attributeOptions.materials.find(
                      (option) => option.value === values.templeMaterial
                    )}
                    placeholder="Select..."
                    classNamePrefix="react-select"
                  />
                  <ErrorMessage
                    name="templeMaterial"
                    component="div"
                    className="text-danger text-sm"
                  />
                </div>
                <div>
                  <label
                    className="form-label font-weight-600 text-sm font-medium"
                    htmlFor="frameMaterial"
                  >
                    Frame Material
                  </label>
                  <Select
                    name="frameMaterial"
                    options={attributeOptions.materials}
                    onChange={(option) =>
                      setFieldValue("frameMaterial", option ? option.value : "")
                    }
                    value={attributeOptions.materials.find(
                      (option) => option.value === values.frameMaterial
                    )}
                    placeholder="Select..."
                    classNamePrefix="react-select"
                  />
                  <ErrorMessage
                    name="frameMaterial"
                    component="div"
                    className="text-danger text-sm"
                  />
                </div>
                <div>
                  <label
                    className="form-label font-weight-600 text-sm font-medium"
                    htmlFor="frameColor"
                  >
                    Frame Color
                  </label>
                  <Select
                    name="frameColor"
                    options={attributeOptions.colors}
                    onChange={(option) =>
                      setFieldValue("frameColor", option ? option.value : "")
                    }
                    value={attributeOptions.colors.find(
                      (option) => option.value === values.frameColor
                    )}
                    placeholder="Select..."
                    classNamePrefix="react-select"
                  />
                  <ErrorMessage
                    name="frameColor"
                    component="div"
                    className="text-danger text-sm"
                  />
                </div>
                <div>
                  <label
                    className="form-label font-weight-600 text-sm font-medium"
                    htmlFor="templeColor"
                  >
                    Temple Color
                  </label>
                  <Select
                    name="templeColor"
                    options={attributeOptions.colors}
                    onChange={(option) =>
                      setFieldValue("templeColor", option ? option.value : "")
                    }
                    value={attributeOptions.colors.find(
                      (option) => option.value === values.templeColor
                    )}
                    placeholder="Select..."
                    classNamePrefix="react-select"
                  />
                  <ErrorMessage
                    name="templeColor"
                    component="div"
                    className="text-danger text-sm"
                  />
                </div>
              </div>
            )}

            <p
              className="text-decoration-underline pointer mb-0"
              onClick={() => toggleSection("additionalDetails")}
            >
              Additional Details
            </p>
            {showSections.additionalDetails && (
              <div className="d-flex flex-column gap-4">
                <div>
                  <label
                    className="form-label font-weight-600 text-sm font-medium"
                    htmlFor="prescriptionType"
                  >
                    Prescription Type
                  </label>
                  <Select
                    name="prescriptionType"
                    options={attributeOptions.prescriptionTypes}
                    onChange={(option) =>
                      setFieldValue(
                        "prescriptionType",
                        option ? option.value : ""
                      )
                    }
                    value={attributeOptions.prescriptionTypes.find(
                      (option) => option.value === values.prescriptionType
                    )}
                    placeholder="Select..."
                    classNamePrefix="react-select"
                  />
                  <ErrorMessage
                    name="prescriptionType"
                    component="div"
                    className="text-danger text-sm"
                  />
                </div>
                <div>
                  <label
                    className="form-label font-weight-600 text-sm font-medium"
                    htmlFor="frameSize"
                  >
                    Frame Size
                  </label>
                  <Select
                    name="frameSize"
                    options={frameSizeOptions}
                    onChange={(option) =>
                      setFieldValue("frameSize", option ? option.value : "")
                    }
                    value={frameSizeOptions.find(
                      (option) => option.value === values.frameSize
                    )}
                    placeholder="Select..."
                    classNamePrefix="react-select"
                  />
                  <ErrorMessage
                    name="frameSize"
                    component="div"
                    className="text-danger text-sm"
                  />
                </div>
                <div>
                  <label
                    className="form-label font-weight-600 text-sm font-medium"
                    htmlFor="frameWidth"
                  >
                    Frame Width
                  </label>
                  <Field
                    type="text"
                    name="frameWidth"
                    className="form-control"
                  />
                  <ErrorMessage
                    name="frameWidth"
                    component="div"
                    className="text-danger text-sm"
                  />
                </div>
                <div>
                  <label
                    className="form-label font-weight-600 text-sm font-medium"
                    htmlFor="frameDimensions"
                  >
                    Frame Dimensions
                  </label>
                  <Field
                    type="text"
                    name="frameDimensions"
                    className="form-control"
                  />
                  <ErrorMessage
                    name="frameDimensions"
                    component="div"
                    className="text-danger text-sm"
                  />
                </div>
                <div>
                  <label
                    className="form-label font-weight-600 text-sm font-medium"
                    htmlFor="weight"
                  >
                    Weight
                  </label>
                  <Field type="text" name="weight" className="form-control" />
                  <ErrorMessage
                    name="weight"
                    component="div"
                    className="text-danger text-sm"
                  />
                </div>
              </div>
            )}
            <div className="row">
              <div className="col-2">
                <button
                  type="button"
                  className="btn btn-primary py-2 px-3"
                  onClick={() => setShowModal(true)}
                >
                  Select Photos
                </button>
              </div>
              <div className="col-10">
                <div className="form-group">
                  <label htmlFor="photoInput" className="form-label font-weight-600 text-sm font-medium">
                    Photo Filename
                  </label>
                  <Field
                    type="text"
                    id="photoInput" 
                    name="photos"
                    className="form-control"
                    placeholder="e.g. EyesO_1.png"
                  />
                  <small className="form-text text-muted">
                    Enter photo filename exactly as shown in the working example: "EyesO_1.png"
                  </small>
                </div>
              </div>
              {selectedImage && (
                <div className="col-12 mt-3">
                  <img
                    src={selectedImage}
                    alt="Selected"
                    className="img-fluid rounded"
                    style={{ maxHeight: "100px", objectFit: "cover" }}
                  />
                </div>
              )}
            </div>
            <AssetSelector
              show={showModal}
              onHide={() => setShowModal(false)}
              onSelectImage={(imageSrc) => {
                setSelectedImage(imageSrc);
                setFieldValue("photos", imageSrc);
              }}
            />
            {/* Checkboxes */}
            <div className="d-flex flex-column flex-wrap gap-3">
              <div className="form-check">
                <Field
                  type="checkbox"
                  name="manageStock"
                  className="form-check-input p-2"
                />
                <label className="form-check-label font-weight-600">
                  Manage Stock
                </label>
              </div>
              <div className="form-check">
                <Field
                  type="checkbox"
                  name="inclusiveTax"
                  className="form-check-input p-2"
                />
                <label className="form-check-label font-weight-600">
                  Inclusive Tax
                </label>
              </div>
              <div className="form-check">
                <Field
                  type="checkbox"
                  name="activeInERP"
                  className="form-check-input p-2"
                />
                <label className="form-check-label font-weight-600">
                  Active ERP
                </label>
              </div>
              <div className="form-check">
                <Field
                  type="checkbox"
                  name="activeInWebsite"
                  className="form-check-input p-2"
                />
                <label className="form-check-label font-weight-600">
                  Active Website
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-4 d-flex justify-content-end">
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    {mode === "edit" ? "Updating..." : "Adding..."}
                  </>
                ) : (
                  mode === "edit" ? "Update Product" : "Add Product"
                )}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default EyeGlasses;
