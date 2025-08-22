import React, { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import AssetSelector from "../EyeGlasses/AssetSelector";
import { productAttributeService } from "../../../../services/productAttributeService";
import { toast } from "react-toastify";
import { productService } from "../../../../services/productService";
import { defalutImageBasePath, uploadImage } from "../../../../utils/constants"; // Fixed typo
import { IoClose } from "react-icons/io5";
import productViewService from "../../../../services/Products/productViewService";
import { useNavigate } from "react-router-dom";

// Validation schema using Yup
const validationSchema = Yup.object({
  model: Yup.string().required("Model is required"),
  brand: Yup.string().required("Brand is required"),
  unit: Yup.string().required("Unit is required"),
  sku: Yup.string().required("SKU is required"),
  displayName: Yup.string().required("Display Name is required"),
  HSNCode: Yup.string().required("HSN Code is required"),
  expiry: Yup.number().nullable(),
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
  oldBarcode: Yup.number().nullable(),
  seoTitle: Yup.string(),
  seoDescription: Yup.string(),
  seoImage: Yup.mixed().nullable(),
  productName: Yup.string(),
  prescriptionType: Yup.string().required("prescription Type is required"),
  features: Yup.array().of(Yup.string()).nullable(),
  coatingType: Yup.string(),
  coatingColor: Yup.string(),
  lensTechnology: Yup.string().required("Lens Technology is required"),
  warranty: Yup.string(),
  description: Yup.string(),
  manageStock: Yup.boolean(),
  inclusiveTax: Yup.boolean(),
  activeInERP: Yup.boolean(),
  activeInWebsite: Yup.boolean(),
  isB2B: Yup.boolean(),
  photos: Yup.array().of(Yup.string()).nullable(),
  frameColor: Yup.string(),
  frameCollection: Yup.string(),
});

function SpectacleLens({ initialData = {}, mode = "add" }) {
  // Warn if model is not spectacleLens
  if (initialData?.model && initialData.model !== "spectacleLens") {
    console.warn(
      `Expected model "spectacleLens", but received "${initialData.model}". This data may be intended for another component (e.g., EyeGlasses).`
    );
  }
  const navigate = useNavigate();
  // State for toggle sections
  const [showSections, setShowSections] = useState({
    seoDetails: false,
    productDetails: true,
  });

  // State for modal and selected image
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState([]);

  // Initialize selectedImage based on mode
  useEffect(() => {
    if (mode !== "add" && initialData?.photos) {
      setSelectedImage(
        Array.isArray(initialData.photos)
          ? initialData.photos
          : [initialData.photos]
      );
    } else {
      setSelectedImage([]);
    }
  }, [mode, initialData]);

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
        const attributeTypes = [
          "brand",
          "unit",
          "color",
          "collection",
          "prescriptionType",
          "feature",
          "lensTechnology",
        ];

        const attributeData = {};
        for (const type of attributeTypes) {
          const response = await productAttributeService.getAttributes(type);
          if (response.success && response.data) {
            attributeData[type] = response.data.map((item) => ({
              value: item._id,
              label: item.name,
            }));
          } else {
            console.error(`Failed to fetch ${type} data:`, response.message);
            toast.error(`Failed to fetch ${type} data`);
          }
        }

        setAttributeOptions({
          brands: attributeData.brand || [],
          units: attributeData.unit || [],
          frameColors: attributeData.color || [],
          frameCollections: attributeData.collection || [],
          prescriptionTypes: attributeData.prescriptionType || [],
          features: attributeData.feature || [],
          lensTechnology: attributeData.lensTechnology || [],
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

  // Initial form values
  const initialValues = {
    model: initialData?.model ?? "spectacleLens",
    brand: initialData?.brand ?? "",
    unit: initialData?.unit ?? "",
    sku: initialData?.sku ?? "",
    displayName: initialData?.displayName ?? "",
    HSNCode: initialData?.HSNCode ?? "",
    expiry: initialData?.expiry ?? "",
    tax: initialData?.tax ?? "",
    costPrice: initialData?.costPrice ?? "",
    resellerPrice: initialData?.resellerPrice ?? "",
    MRP: initialData?.MRP ? String(initialData.MRP) : "",
    discount: initialData?.discount ?? "",
    sellPrice: initialData?.sellPrice ?? "",
    incentiveAmount: initialData?.incentiveAmount ?? 0,
    oldBarcode: initialData?.oldBarcode ?? "",
    seoTitle: initialData?.seoTitle ?? "",
    seoDescription: initialData?.seoDescription ?? "",
    seoImage: initialData?.seoImage ?? null,
    productName: initialData?.productName ?? "",
    prescriptionType: initialData?.prescriptionType ?? "",
    features: Array.isArray(initialData?.features) ? initialData.features : [],
    coatingType: initialData?.coatingType ?? "",
    coatingColor: initialData?.coatingColor ?? "",
    lensTechnology: initialData?.lensTechnology ?? "",
    warranty: initialData?.warranty ?? "",
    description: initialData?.description ?? "",
    manageStock: initialData?.manageStock ?? true,
    inclusiveTax: initialData?.inclusiveTax ?? true,
    activeInERP: initialData?.activeInERP ?? true,
    activeInWebsite: initialData?.activeInWebsite ?? false,
    isB2B: initialData?.isB2B ?? false,
    photos: Array.isArray(initialData?.photos)
      ? initialData.photos
      : initialData?.photos
      ? [initialData.photos]
      : [],
    frameColor: initialData?.frameColor ?? "",
    frameCollection: initialData?.frameCollection ?? "",
  };

  // Handle form submission
  const handleSubmit = async (
    values,
    { setSubmitting, resetForm, setErrors }
  ) => {
    console.log(`${mode} values:`, values);
    setSubmitting(true);

    try {
      // Handle image upload for seoImage
      if (values.seoImage instanceof File) {
        console.log("Uploading SEO image:", values.seoImage.name);
        try {
          const res = await uploadImage(values.seoImage, values.seoImage.name);
          values.seoImage = res; // Use the returned URL
          console.log("SEO image uploaded:", res);
        } catch (error) {
          console.error("SEO image upload failed:", error);
          toast.error("Failed to upload SEO image");
          setSubmitting(false);
          return;
        }
      }

      // Prepare the payload
      const payload = {
        _id: initialData?._id,
        model: values.model || "spectacleLens",
        brand: values.brand || "",
        unit: values.unit || "",
        sku: values.sku || "",
        displayName: values.displayName || "",
        HSNCode: values.HSNCode || "",
        expiry: values.expiry ? Number(values.expiry) : null,
        tax: parseFloat(values.tax) || 0,
        costPrice: parseFloat(values.costPrice) || 0,
        resellerPrice: parseFloat(values.resellerPrice) || 0,
        MRP: values.MRP || "",
        discount: parseFloat(values.discount) || 0,
        sellPrice: parseFloat(values.sellPrice) || 0,
        incentiveAmount: parseFloat(values.incentiveAmount) || 0,
        oldBarcode: values.oldBarcode ? Number(values.oldBarcode) : null,
        seoTitle: values.seoTitle || "",
        seoDescription: values.seoDescription || "",
        seoImage: values.seoImage || "",
        productName: values.productName || "",
        prescriptionType: values.prescriptionType || "",
        features: Array.isArray(values.features) ? values.features : [],
        coatingType: values.coatingType || "",
        coatingColor: values.coatingColor || "",
        lensTechnology: values.lensTechnology || "",
        warranty: values.warranty || "",
        description: values.description || "",
        manageStock: values.manageStock ?? true,
        inclusiveTax: values.inclusiveTax ?? true,
        activeInERP: values.activeInERP ?? true,
        activeInWebsite: values.activeInWebsite ?? false,
        isB2B: values.isB2B ?? false,
        photos: Array.isArray(values.photos)
          ? values.photos
          : values.photos
          ? [values.photos]
          : [],
        frameColor: values.frameColor || "",
        frameCollection: values.frameCollection || "",
        __t: "spectacleLens",
        storeFront: initialData?.storeFront || [],
      };

      console.log("Payload:", payload);

      if (mode === "edit") {
        console.log("Updating product with ID:", initialData?._id);
        const response = await productViewService.updateSpectacleLens(
          initialData?._id,
          payload,
          "spectacleLens"
        );
        console.log("Update response:", response);

        if (response.success) {
          toast.success("Product updated successfully");
          resetForm();
          navigate("/products/view");
        } else {
          toast.error(response.message || "Failed to update product");
          setErrors({ submit: response.message || "Failed to update product" });
        }
      } else {
        console.log("Adding new product");
        const response = await productService.addProduct(
          payload,
          "spectacleLens"
        );
        console.log("Add response:", response);

        if (response.success) {
          toast.success("Product added successfully");
          resetForm();
          setSelectedImage([]); // Reset images
        } else {
          toast.error(response.message || "Failed to add product");
          setErrors({ submit: response.message || "Failed to add product" });
        }
      }
    } catch (error) {
      console.error("Submit error:", error);
      if (
        error.response?.data?.error?.includes("code: 11000") &&
        error.response?.data?.error?.includes("sku")
      ) {
        toast.error("SKU already exists. Please use a unique SKU.");
        setErrors({ submit: "SKU already exists. Please use a unique SKU." });
      } else {
        toast.error(`Error: ${error.message || "Failed to process request"}`);
        setErrors({ submit: error.message || "Failed to process request" });
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Display loading state while fetching options
  if (loading && attributeOptions.brands.length === 0) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "400px" }}
      >
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
        {({ setFieldValue, values, errors }) => (
          <Form className="d-flex flex-column gap-4">
            {errors.submit && (
              <div className="alert alert-danger">{errors.submit}</div>
            )}

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
                Expiry
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
              Add SEO Details
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
                      const file = event.currentTarget.files[0];
                      if (file) {
                        setFieldValue("seoImage", file);
                      }
                    }}
                  />
                  <small className="form-text text-muted">
                    Selected file will be sent as:
                    eyesdeal/website/image/seo/[filename]
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
                    Prescription Type <span className="text-danger">*</span>
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
                    isMulti
                    onChange={(options) =>
                      setFieldValue(
                        "features",
                        options ? options.map((opt) => opt.value) : []
                      )
                    }
                    value={attributeOptions.features.filter((option) =>
                      values.features.includes(option.value)
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
                      setFieldValue(
                        "lensTechnology",
                        option ? option.value : ""
                      )
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

            {/* Photos Section */}
            <div className="row">
              {mode === "add" && (
                <div className="col-2">
                  <button
                    type="button"
                    className="btn btn-primary py-2 px-3"
                    onClick={() => setShowModal(true)}
                  >
                    Select Photos
                  </button>
                </div>
              )}
              <div className="col-10">
                <div className="form-group">
                  <label
                    htmlFor="photoInput"
                    className="form-label font-weight-600 text-sm font-medium"
                  >
                    Photo Filename
                  </label>
                  <Field
                    type="text"
                    id="photoInput"
                    name="photos"
                    className="form-control"
                    placeholder="e.g. /eyesdeal/Lens_1.png"
                    disabled
                  />
                  <small className="form-text text-muted">
                    Use the Select Photos button to choose images from the media
                    library.
                  </small>
                  <ErrorMessage
                    name="photos"
                    component="div"
                    className="text-danger text-sm"
                  />
                </div>
              </div>
            </div>

            <div>
              {selectedImage && selectedImage.length > 0 ? (
                <div className="row mt-4 g-3">
                  {selectedImage.map((url, index) => (
                    <div className="col-12 col-md-6 col-lg-3" key={index}>
                      <div className="position-relative border text-center border-black rounded p-2">
                        <img
                          src={`${defalutImageBasePath}${url}`}
                          alt={`Product ${index + 1}`}
                          className="img-fluid rounded w-50 h-auto object-fit-cover"
                          style={{ maxHeight: "100px", objectFit: "cover" }}
                        />
                        <button
                          className="position-absolute top-0 start-0 translate-middle bg-white rounded-circle border border-light p-1"
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            const newImages = selectedImage.filter(
                              (_, i) => i !== index
                            );
                            setSelectedImage(newImages);
                            setFieldValue("photos", newImages);
                          }}
                          aria-label="Remove image"
                        >
                          <IoClose size={16} className="text-dark" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                mode === "edit" && (
                  <div className="text-center text-muted">
                    No images available.
                  </div>
                )
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
                value={attributeOptions.frameColors.find(
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
                htmlFor="frameCollection"
              >
                Frame Collection
              </label>
              <Select
                name="frameCollection"
                options={attributeOptions.frameCollections}
                onChange={(option) =>
                  setFieldValue("frameCollection", option ? option.value : "")
                }
                value={attributeOptions.frameCollections.find(
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
              <div className="form-check">
                <Field
                  type="checkbox"
                  name="isB2B"
                  className="form-check-input p-2"
                />
                <label className="form-check-label font-weight-600">
                  IS B2B
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="d-flex gap-3">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    {mode === "edit" ? "Updating..." : "Submitting..."}
                  </>
                ) : mode === "edit" ? (
                  "Update"
                ) : (
                  "Submit"
                )}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default SpectacleLens;
