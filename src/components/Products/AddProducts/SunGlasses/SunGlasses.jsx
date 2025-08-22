import React, { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import AssetSelector from "../EyeGlasses/AssetSelector";
import { productAttributeService } from "../../../../services/productAttributeService";
import { toast } from "react-toastify";
import { productService } from "../../../../services/productService";
import { defalutImageBasePath, uploadImage } from "../../../../utils/constants";
import { IoClose } from "react-icons/io5";
import productViewService from "../../../../services/Products/productViewService";
import { useNavigate } from "react-router-dom";

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
  oldBarcode: Yup.string().nullable(),
  seoTitle: Yup.string(),
  seoDescription: Yup.string(),
  seoImage: Yup.mixed(),
  description: Yup.string(),
  warranty: Yup.string(),
  gender: Yup.string(),
  modelNumber: Yup.string(),
  colorNumber: Yup.string(),
  lensTechnology: Yup.string(),
  lensColor: Yup.string(),
  frameType: Yup.string().required("Frame Type is required"),
  frameShape: Yup.string().required("Frame Shape is required"),
  frameStyle: Yup.string().required("Frame Style is required"),
  templeMaterial: Yup.string(),
  frameMaterial: Yup.string(),
  frameColor: Yup.string(),
  templeColor: Yup.string(),
  frameSize: Yup.string(),
  frameWidth: Yup.string(),
  frameDimensions: Yup.string(),
  prescriptionType: Yup.string(),
  frameCollection: Yup.string(),
  features: Yup.string(),
  weight: Yup.string(),
  manageStock: Yup.boolean(),
  inclusiveTax: Yup.boolean(),
  activeInERP: Yup.boolean(),
  activeInWebsite: Yup.boolean(),
  isB2B: Yup.boolean(),
  photos: Yup.string(),
  color: Yup.string().required("Color is required"),
  material: Yup.string().required("Material is required"),
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

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "unisex", label: "Unisex" },
];

const lensTechnologyOptions = [
  { value: "polarized", label: "Polarized" },
  { value: "uvProtection", label: "UV Protection" },
  { value: "photochromic", label: "Photochromic" },
];

const frameTypeOptions = [
  { value: "fullRim", label: "Full Rim" },
  { value: "halfRim", label: "Half Rim" },
  { value: "rimless", label: "Rimless" },
];

const frameShapeOptions = [
  { value: "aviator", label: "Aviator" },
  { value: "wayfarer", label: "Wayfarer" },
  { value: "round", label: "Round" },
];

const frameStyleOptions = [
  { value: "classic", label: "Classic" },
  { value: "modern", label: "Modern" },
  { value: "sporty", label: "Sporty" },
];

const materialOptions = [
  { value: "1", label: "Metal" },
  { value: "2", label: "Plastic" },
  { value: "3", label: "Acetate" },
];

const colorOptions = [
  { value: "black", label: "Black" },
  { value: "brown", label: "Brown" },
  { value: "silver", label: "Silver" },
];

const frameSizeOptions = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
];

const prescriptionTypeOptions = [
  { value: "singleVision", label: "Single Vision" },
  { value: "progressive", label: "Progressive" },
  { value: "nonPrescription", label: "Non-Prescription" },
];

const frameCollectionOptions = [
  { value: "premium", label: "Premium" },
  { value: "classic", label: "Classic" },
  { value: "designer", label: "Designer" },
];

const featuresOptions = [
  { value: "lightweight", label: "Lightweight" },
  { value: "durable", label: "Durable" },
  { value: "flexible", label: "Flexible" },
];

function SunGlasses({ initialData = {}, mode = "add" }) {
  // Warn if model is not sunGlasses
  if (initialData?.model && initialData.model !== "sunGlasses") {
    console.warn(
      `Expected model "sunGlasses", but received "${initialData.model}". This data may be intended for another component (e.g., EyeGlasses).`
    );
  }
  const navigate = useNavigate();
  // State for toggle sections
  const [showSections, setShowSections] = useState({
    seoDetails: false,
    productDetails: false,
    frameDetails: false,
    additionalDetails: false,
  });
  // State for modal and selected image
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  useEffect(() => {
    if (mode !== "add") {
      setSelectedImage(
        initialData?.photos
          ? Array.isArray(initialData.photos)
            ? initialData.photos
            : initialData.photos
          : null
      );
    } else {
      setSelectedImage([]);
    }
  }, [mode]);

  const [attributeOptions, setAttributeOptions] = useState({
    brands: [],
    units: [],
    colors: [],
    materials: [],
    frameTypes: [],
    frameShapes: [],
    frameStyles: [],
    prescriptionTypes: [],
  });

  // State for loading
  const [loading, setLoading] = useState(false);

  // Fetch attribute data from API
  useEffect(() => {
    const fetchAttributes = async () => {
      try {
        setLoading(true);
        const brandResponse = await productAttributeService.getAttributes(
          "brand"
        );
        const unitResponse = await productAttributeService.getAttributes(
          "unit"
        );
        const colorResponse = await productAttributeService.getAttributes(
          "color"
        );
        const materialResponse = await productAttributeService.getAttributes(
          "material"
        );
        const frameTypeResponse = await productAttributeService.getAttributes(
          "frameType"
        );
        const frameShapeResponse = await productAttributeService.getAttributes(
          "frameShape"
        );
        const frameStyleResponse = await productAttributeService.getAttributes(
          "frameStyle"
        );
        const prescriptionTypeResponse =
          await productAttributeService.getAttributes("prescriptionType");
        const collectionResponse = await productAttributeService.getAttributes(
          "collection"
        );

        if (brandResponse.success) {
          setAttributeOptions((prev) => ({
            ...prev,
            brands: brandResponse.data.map((item) => ({
              value: item._id,
              label: item.name,
            })),
          }));
        }

        if (unitResponse.success) {
          setAttributeOptions((prev) => ({
            ...prev,
            units: unitResponse.data.map((item) => ({
              value: item._id,
              label: item.name,
            })),
          }));
        }

        if (colorResponse.success) {
          setAttributeOptions((prev) => ({
            ...prev,
            colors: colorResponse.data.map((item) => ({
              value: item._id,
              label: item.name,
            })),
          }));
        }

        if (materialResponse.success) {
          setAttributeOptions((prev) => ({
            ...prev,
            materials: materialResponse.data.map((item) => ({
              value: item._id,
              label: item.name,
            })),
          }));
        }

        if (frameTypeResponse.success) {
          setAttributeOptions((prev) => ({
            ...prev,
            frameTypes: frameTypeResponse.data.map((item) => ({
              value: item._id,
              label: item.name,
            })),
          }));
        }

        if (frameShapeResponse.success) {
          setAttributeOptions((prev) => ({
            ...prev,
            frameShapes: frameShapeResponse.data.map((item) => ({
              value: item._id,
              label: item.name,
            })),
          }));
        }

        if (frameStyleResponse.success) {
          setAttributeOptions((prev) => ({
            ...prev,
            frameStyles: frameStyleResponse.data.map((item) => ({
              value: item._id,
              label: item.name,
            })),
          }));
        }

        if (prescriptionTypeResponse.success) {
          setAttributeOptions((prev) => ({
            ...prev,
            prescriptionTypes: prescriptionTypeResponse.data.map((item) => ({
              value: item._id,
              label: item.name,
            })),
          }));
        }

        if (collectionResponse.success) {
          setAttributeOptions((prev) => ({
            ...prev,
            frameCollections: collectionResponse.data.map((item) => ({
              value: item._id,
              label: item.name,
            })),
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
    model: initialData?.model ?? "sunGlasses",
    tax: initialData?.tax ?? "",
    brand: initialData?.brand ?? "",
    sku: initialData?.sku ?? "",
    displayName: initialData?.displayName ?? "",
    HSNCode: initialData?.HSNCode ?? "",
    unit: initialData?.unit ?? "",
    costPrice: initialData?.costPrice ?? "",
    resellerPrice: initialData?.resellerPrice ?? "",
    MRP: initialData?.MRP ? String(initialData.MRP) : "",
    discount: initialData?.discount ?? "",
    sellPrice: initialData?.sellPrice ?? "",
    incentiveAmount: initialData?.incentiveAmount ?? 0,
    oldBarcode: initialData?.oldBarcode ?? "", // Directly using oldBarcode key
    seoTitle: initialData?.seoTitle ?? "",
    seoDescription: initialData?.seoDescription ?? "",
    seoImage: initialData?.seoImage ?? null,
    description: initialData?.description ?? "",
    warranty: initialData?.warranty ?? "",
    gender: initialData?.gender ?? "",
    modelNumber: initialData?.modelNumber ?? "",
    colorNumber: initialData?.colorNumber ?? "",
    lensTechnology: initialData?.lensTechnology ?? "",
    lensColor: initialData?.lensColor ?? "",
    frameType: initialData?.frameType ?? "",
    frameShape: initialData?.frameShape ?? "",
    frameStyle: initialData?.frameStyle ?? "",
    templeMaterial: initialData?.templeMaterial ?? "",
    frameMaterial: initialData?.frameMaterial ?? "",
    frameColor: initialData?.frameColor ?? "",
    templeColor: initialData?.templeColor ?? "",
    frameSize: initialData?.frameSize ?? "",
    frameWidth: initialData?.frameWidth ?? "",
    frameDimensions: initialData?.frameDimensions ?? "",
    prescriptionType: initialData?.prescriptionType ?? "",
    frameCollection: initialData?.frameCollection ?? "",
    features: Array.isArray(initialData?.features) ? initialData.features : "",
    weight: initialData?.weight ?? "",
    manageStock: initialData?.manageStock ?? true,
    inclusiveTax: initialData?.inclusiveTax ?? true,
    activeInERP: initialData?.activeInERP ?? true,
    activeInWebsite: initialData?.activeInWebsite ?? false,
    isB2B: initialData?.isB2B ?? false,
    photos: Array.isArray(initialData?.photos)
      ? initialData.photos.length > 0
        ? initialData.photos[0]
        : ""
      : initialData?.photos ?? "",
    color: initialData?.color ?? "",
    material: initialData?.material ?? "",
  };

  // Handle form submission
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    console.log(`${mode} values:`, values);
    setSubmitting(true);

    try {
      // Handle image upload for seoImage
      if (values.seoImage instanceof File) {
        const res = await uploadImage(values.seoImage, values.seoImage.name);
        values.seoImage = res; // Set the URL in the form values
      }

      // Prepare the payload
      const payload = {
        _id: initialData?._id,
        model: values.model || "sunGlasses",
        modelNumber: values.modelNumber || "",
        colorNumber: values.colorNumber || "",
        frameType: values.frameType || null,
        frameShape: values.frameShape || null,
        frameStyle: values.frameStyle || null,
        templeMaterial: values.templeMaterial || null,
        frameMaterial: values.frameMaterial || null,
        templeColor: values.templeColor || null,
        frameColor: values.frameColor || null,
        gender: values.gender || "",
        frameSize: values.frameSize || "",
        frameWidth: values.frameWidth || "",
        frameDimensions: values.frameDimensions || "",
        weight: values.weight || "",
        prescriptionType: values.prescriptionType || null,
        frameCollection: values.frameCollection || null,
        features: Array.isArray(values.features)
          ? values.features
          : values.features
          ? [values.features]
          : [],
        oldBarcode: values.oldBarcode ? Number(values.oldBarcode) : null,
        sku: values.sku || "",
        displayName: values.displayName || "",
        HSNCode: values.HSNCode || "",
        brand: values.brand || "",
        unit: values.unit || "",
        warranty: values.warranty || "",
        tax: parseFloat(values.tax) || 0,
        description: values.description || "",
        costPrice: parseFloat(values.costPrice) || 0,
        resellerPrice: parseFloat(values.resellerPrice) || 0,
        MRP: parseFloat(values.MRP) || 0,
        discount: parseFloat(values.discount) || 0,
        sellPrice: parseFloat(values.sellPrice) || 0,
        manageStock: values.manageStock ?? true,
        inclusiveTax: values.inclusiveTax ?? true,
        incentiveAmount: parseFloat(values.incentiveAmount) || 0,
        photos: Array.isArray(values.photos)
          ? values.photos
          : values.photos
          ? [values.photos]
          : [],
        lensColor: values.lensColor || "",
        lensTechnology: values.lensTechnology || null,
        activeInERP: values.activeInERP ?? true,
        activeInWebsite: values.activeInWebsite ?? false,
        isB2B: values.isB2B ?? false,
        __t: "sunGlasses",
        storeFront: initialData?.storeFront || [],
        seoDescription: values.seoDescription || "",
        seoImage: values.seoImage || "",
        seoTitle: values.seoTitle || "",
      };

      if (mode === "edit") {
        const response = await productViewService.updateSunGlasses(
          initialData?._id,
          payload,
          "sunGlasses"
        );

        if (response.success) {
          toast.success("Product updated successfully");
          resetForm();
          navigate("/products/view");
        } else {
          toast.error(response.message || "Failed to update product");
        }
      } else {
        const response = await productService.addProduct(payload, "sunGlasses");

        if (response.success) {
          toast.success("Product added successfully");
          resetForm();
        } else {
          toast.error(response.message || "Failed to add product");
        }
      }
    } catch (error) {
      if (
        error.response?.data?.error?.includes("code: 11000") &&
        error.response?.data?.error?.includes("sku")
      ) {
        toast.error("SKU already exists. Please use a unique SKU.");
      } else {
        toast.error("An error occurred while processing your request");
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
    <div className="p-0 mt-5  mx-auto">
      <Formik
        initialValues={initialValues}
        // validationSchema={validationSchema}
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
                    htmlFor="lensTechnology"
                  >
                    Lens Technology
                  </label>
                  <Select
                    name="lensTechnology"
                    options={lensTechnologyOptions}
                    onChange={(option) =>
                      setFieldValue(
                        "lensTechnology",
                        option ? option.value : ""
                      )
                    }
                    value={lensTechnologyOptions.find(
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
                    htmlFor="lensColor"
                  >
                    Lens Color
                  </label>
                  <Field
                    type="text"
                    name="lensColor"
                    className="form-control"
                  />
                  <ErrorMessage
                    name="lensColor"
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
                    htmlFor="frameCollection"
                  >
                    Frame Collection
                  </label>
                  <Select
                    name="frameCollection"
                    options={attributeOptions.frameCollections}
                    onChange={(option) =>
                      setFieldValue(
                        "frameCollection",
                        option ? option.value : ""
                      )
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
                <div>
                  <label
                    className="form-label font-weight-600 text-sm font-medium"
                    htmlFor="features"
                  >
                    Frame Features
                  </label>
                  <Select
                    name="features"
                    options={featuresOptions}
                    onChange={(option) =>
                      setFieldValue("features", option ? option.value : "")
                    }
                    value={featuresOptions.find(
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

            {/* Select Photos */}
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
                            onClick={() =>
                              setSelectedImage(
                                selectedImage.filter((_, i) => i !== index)
                              )
                            }
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
            </div>
            <AssetSelector
              show={showModal}
              onHide={() => setShowModal(false)}
              onSelectImage={(imageSrc) => {
                setSelectedImage(imageSrc);
                setFieldValue("photos", imageSrc);
              }}
            />

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

export default SunGlasses;
