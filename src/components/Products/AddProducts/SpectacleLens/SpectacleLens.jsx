import React, { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import AssetSelector from "../EyeGlasses/AssetSelector";
import { productAttributeService } from "../../../../services/productAttributeService";
import { toast } from "react-toastify";
import { productService } from "../../../../services/productService";
import { uploadImage } from "../../../../utils/constants";

// Validation schema using Yup
const validationSchema = Yup.object({
  model: Yup.string().required("Model is required"),
  brand: Yup.string().required("Brand is required"),
  unit: Yup.string().required("Unit is required"),
  sku: Yup.string().required("SKU is required"),
  displayName: Yup.string().required("Display Name is required"),
  HSNCode: Yup.string().required("HSN Code is required"),
  expiry: Yup.string().nullable(),
  tax: Yup.number()
    .required("Tax is required")
    .min(0, "Tax cannot be negative"),
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
  oldBarcode: Yup.string().nullable(),
  seoTitle: Yup.string(),
  seoDescription: Yup.string(),
  seoImage: Yup.mixed(),
  productName: Yup.string(),
  prescriptionType: Yup.string(),
  features: Yup.string(),
  coatingType: Yup.string(),
  coatingColor: Yup.string(),
  lensTechnology: Yup.string(),
  warranty: Yup.string(),
  description: Yup.string(),
  manageStock: Yup.boolean(),
  inclusiveTax: Yup.boolean(),
  activeInERP: Yup.boolean(),
  activeInWebsite: Yup.boolean(),
  photos: Yup.string(),
  frameColor: Yup.string().required("Frame Color is required"),
  frameCollection: Yup.string().required("Frame Collection is required"),
});

// Options for react-select
const unitOptions = [
  { value: "piece", label: "Piece" },
  { value: "pair", label: "Pair" },
];

const brandOptions = [
  { value: "brand1", label: "Brand 1" },
  { value: "brand2", label: "Brand 2" },
  { value: "brand3", label: "Brand 3" },
];

const prescriptionTypeOptions = [
  { value: "singleVision", label: "Single Vision" },
  { value: "progressive", label: "Progressive" },
  { value: "nonPrescription", label: "Non-Prescription" },
];

const featuresOptions = [
  { value: "antiReflective", label: "Anti-Reflective" },
  { value: "scratchResistant", label: "Scratch Resistant" },
  { value: "blueLightBlocking", label: "Blue Light Blocking" },
];

function SpectacleLens({ initialData = {}, mode = "add" }) {
  // Warn if model is not spectacleLens
  if (initialData?.model && initialData.model !== "spectacleLens") {
    console.warn(
      `Expected model "spectacleLens", but received "${initialData.model}". This data may be intended for another component (e.g., EyeGlasses).`
    );
  }

  // State for toggle sections
  const [showSections, setShowSections] = useState({
    seoDetails: false,
    productDetails: false,
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

  // State for attribute options
  const [attributeOptions, setAttributeOptions] = useState({
    brands: [],
    units: [],
    frameColors: [],
    frameCollections: [],
    prescriptionTypes: [],
    features: [],
    lensTechnology: [],
  });

  // Fetch attribute data from API
  useEffect(() => {
    const fetchAttributes = async () => {
      try {
        setLoading(true);
        const brandResponse = await productAttributeService.getAttributes("brand");
        const unitResponse = await productAttributeService.getAttributes("unit");
        const frameColorResponse = await productAttributeService.getAttributes("color");
        const frameCollectionResponse = await productAttributeService.getAttributes("collection");
        const prescriptionTypeResponse = await productAttributeService.getAttributes("prescriptionType");
        const lensTechnologyResponse = await productAttributeService.getAttributes("lensTechnology");
        const featuresResponse = await productAttributeService.getAttributes("feature");

        if (brandResponse.success) {
          setAttributeOptions((prev) => ({
            ...prev,
            brands: brandResponse.data.map(item => ({ value: item._id, label: item.name })),
          }));
        }

        if (unitResponse.success) {
          setAttributeOptions((prev) => ({
            ...prev,
            units: unitResponse.data.map(item => ({ value: item._id, label: item.name })),
          }));
        }

        if (frameColorResponse.success) {
          setAttributeOptions((prev) => ({
            ...prev,
            frameColors: frameColorResponse.data.map(item => ({ value: item._id, label: item.name })),
          }));
        }

        if (frameCollectionResponse.success) {
          setAttributeOptions((prev) => ({
            ...prev,
            frameCollections: frameCollectionResponse.data.map(item => ({ value: item._id, label: item.name })),
          }));
        }

        if (prescriptionTypeResponse.success) {
          setAttributeOptions((prev) => ({
            ...prev,
            prescriptionTypes: prescriptionTypeResponse.data.map(item => ({ value: item._id, label: item.name })),
          }));
        }

        if (lensTechnologyResponse.success) {
          setAttributeOptions((prev) => ({
            ...prev,
            lensTechnology: lensTechnologyResponse.data.map(item => ({ value: item._id, label: item.name })),
          }));
        }

        if (featuresResponse.success) {
          setAttributeOptions((prev) => ({
            ...prev,
            features: featuresResponse.data.map(item => ({ value: item._id, label: item.name })),
          }));
        }
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

  // Initial form values
  const initialValues = {
    model: initialData?.model || "spectacleLens",
    brand: initialData?.brand || "",
    unit: initialData?.unit || "",
    sku: initialData?.sku || "",
    displayName: initialData?.displayName || "",
    HSNCode: initialData?.HSNCode || "",
    expiry: initialData?.expiry || "",
    tax: initialData?.tax || "",
    costPrice: initialData?.costPrice || "",
    resellerPrice: initialData?.resellerPrice || "",
    MRP: initialData?.mrp ? String(initialData.mrp) : "",
    discount: initialData?.discount || "",
    sellPrice: initialData?.sellPrice || "",
    incentiveAmount: initialData?.incentiveAmount || 0,
    oldBarcode: initialData?.barcode || "",
    seoTitle: initialData?.seoTitle || "",
    seoDescription: initialData?.seoDescription || "",
    seoImage: initialData?.seoImage || null,
    productName: initialData?.productName || "",
    prescriptionType: initialData?.prescriptionType || "",
    features: initialData?.features || "",
    coatingType: initialData?.coatingType || "",
    coatingColor: initialData?.coatingColor || "",
    lensTechnology: initialData?.lensTechnology || "",
    warranty: initialData?.warranty || "",
    description: initialData?.description || "",
    manageStock: initialData?.manageStock ?? true,
    inclusiveTax: initialData?.inclusiveTax ?? true,
    activeInERP: initialData?.activeInERP ?? true,
    activeInWebsite: initialData?.activeInWebsite ?? false,
    photos: initialData?.photos
      ? Array.isArray(initialData.photos)
        ? initialData.photos[0]
        : initialData.photos
      : "",
    frameColor: initialData?.frameColor || "",
    frameCollection: initialData?.frameCollection || "",
  };

  // Handle form submission
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    console.log(`${mode} values:`, values);
    setSubmitting(true);
    
    try {
      // Handle image upload for seoImage
      if (values.seoImage instanceof File) {
        const res = await uploadImage(values.seoImage, values.seoImage.name);
        values.seoImage = `eyesdeal/website/image/seo/${values.seoImage.name}`; // Set the path
      }

      // Prepare the payload
      const payload = {
        ...values,
        // Ensure oldBarcode is a number or null
        oldBarcode: values.oldBarcode ? Number(values.oldBarcode) : null,
        // Ensure these fields are properly formatted
        features: Array.isArray(values.features) ? values.features : [values.features].filter(Boolean),
        photos: Array.isArray(values.photos) ? values.photos : [values.photos].filter(Boolean)
      };

      if (mode === "edit") {
        // Call the update API
        const response = await productService.updateProduct("spectacleLens", initialData?.id, payload);
        
        if (response.success) {
          toast.success("Product updated successfully");
          resetForm();
        } else {
          toast.error(response.message || "Failed to update product");
        }
      } else {
        // Call the add API
        const response = await productService.addProduct(payload, "spectacleLens");
        
        if (response.success) {
          toast.success("Product added successfully");
          resetForm();
        } else {
          toast.error(response.message || "Failed to add product");
        }
      }
    } catch (error) {
      console.error("Error in product operation:", error);
      toast.error("An error occurred while processing your request");
    } finally {
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
    <div className="p-0 mt-5 mx-auto">
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
                htmlFor="expiry"
              >
                Expiry <span className="text-danger">*</span>
              </label>
              <Field type="number" name="expiry" className="form-control" />
              <ErrorMessage
                name="expiry"
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
                htmlFor="oldBarcode"
              >
                Old Barcode
              </label>
              <Field type="number" name="oldBarcode" className="form-control" />
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
                    Image
                  </label>
                  <input
                    type="file"
                    name="seoImage"
                    className="form-control"
                    onChange={(event) =>
                      setFieldValue("seoImage", event.currentTarget.files[0])
                    }
                  />
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
                    htmlFor="productName"
                  >
                    Product Name
                  </label>
                  <Field
                    type="text"
                    name="productName"
                    className="form-control"
                  />
                  <ErrorMessage
                    name="productName"
                    component="div"
                    className="text-danger text-sm"
                  />
                </div>
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
                    htmlFor="features"
                  >
                    Features
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
                <div>
                  <label
                    className="form-label font-weight-600 text-sm font-medium"
                    htmlFor="coatingType"
                  >
                    Coating Type
                  </label>
                  <Field
                    type="text"
                    name="coatingType"
                    className="form-control"
                  />
                  <ErrorMessage
                    name="coatingType"
                    component="div"
                    className="text-danger text-sm"
                  />
                </div>
                <div>
                  <label
                    className="form-label font-weight-600 text-sm font-medium"
                    htmlFor="coatingColor"
                  >
                    Coating Color
                  </label>
                  <Field
                    type="text"
                    name="coatingColor"
                    className="form-control"
                  />
                  <ErrorMessage
                    name="coatingColor"
                    component="div"
                    className="text-danger text-sm"
                  />
                </div>
                <div>
                  <label
                    className="form-label font-weight-600 text-sm font-medium"
                    htmlFor="lensTechnology"
                  >
                    Lens Technology <span className="text-danger">*</span>
                  </label>
                  <Select
                    name="lensTechnology"
                    options={attributeOptions.lensTechnology}
                    onChange={(option) =>
                      setFieldValue("lensTechnology", option ? option.value : "")
                    }
                    value={attributeOptions.lensTechnology.find(
                      (option) => option.value === values.lensTechnology
                    )}
                    placeholder="Select..."
                    classNamePrefix="react-select"
                  />
                  <ErrorMessage
                    name="lensTechnology"
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
              </div>
            )}

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

            {/* Select Photos */}
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

            <div>
            <label
                    className="form-label font-weight-600 text-sm font-medium"
                    htmlFor="frameColor"
                  >
                    Frame Color
                  </label>
                  <Select
                    name="frameColor"
                    options={attributeOptions.frameColors}
                    onChange={(option) =>
                      setFieldValue("frameColor", option ? option.value : "")
                    }
                    value={attributeOptions?.frameColors.find(
                      (option) => option.value === values.frameColor
                    )}
                    placeholder="Select..."
                    classNamePrefix="react-select"
                  />
              <ErrorMessage name="frameColor" component="div" className="text-danger text-sm" />
            </div>

            <div>
              <label
                className="form-label font-weight-600 text-sm font-medium"
                htmlFor="frameCollection"
              >
                Frame Collection <span className="text-danger">*</span>
              </label>
              <Select
                name="frameCollection"
                options={attributeOptions.frameCollections}
                onChange={(option) => setFieldValue("frameCollection", option ? option.value : "")}
                value={attributeOptions.frameCollections.find((option) => option.value === values.frameCollection)}
                placeholder="Select..."
                classNamePrefix="react-select"
              />
              <ErrorMessage name="frameCollection" component="div" className="text-danger text-sm" />
            </div>

            {/* Submit Button */}
            <div className="d-flex gap-3">
              <button type="submit" className="btn btn-primary">
                {mode === "edit" ? "Update" : "Submit"}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default SpectacleLens;
