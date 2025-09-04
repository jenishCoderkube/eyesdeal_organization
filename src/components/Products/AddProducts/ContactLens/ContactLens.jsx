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
  HSNCode: Yup.string().nullable(),
  brand: Yup.string().required("Brand is required"),
  sku: Yup.string().required("SKU is required"),
  displayName: Yup.string().required("Display Name is required"),
  disposability: Yup.string().required("Disposability is required"),
  tax: Yup.number()
    .required("Tax is required")
    .min(0, "Tax cannot be negative"),
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
  seoTitle: Yup.string().nullable(),
  seoDescription: Yup.string().nullable(),
  seoImage: Yup.mixed().nullable(),
  productName: Yup.string().nullable(),
  lensTechnology: Yup.string().nullable(),
  lensMaterial: Yup.string().nullable(),
  baseCurve: Yup.string().nullable(),
  dia: Yup.string().nullable(),
  waterContent: Yup.string().nullable(),
  expiry: Yup.number().nullable(), // Changed to number to match form input
  lensFeatures: Yup.array().of(Yup.string()).nullable(),
  prescriptionType: Yup.string().nullable(),
  features: Yup.array().of(Yup.string()).nullable(), // Changed to array to match payload
  gender: Yup.string().nullable(),
  warranty: Yup.string().nullable(),
  description: Yup.string().nullable(),
  manageStock: Yup.boolean(),
  inclusiveTax: Yup.boolean(),
  activeInERP: Yup.boolean(),
  activeInWebsite: Yup.boolean(),
  isB2B: Yup.boolean(),
  photos: Yup.array().of(Yup.string()).nullable(), // Changed to array to match payload
});

// Options for react-select (fallback options)
const unitOptions = [
  { value: "piece", label: "Piece" },
  { value: "pair", label: "Pair" },
  { value: "box", label: "Box" },
];

const brandOptions = [
  { value: "brand1", label: "Brand 1" },
  { value: "brand2", label: "Brand 2" },
  { value: "brand3", label: "Brand 3" },
];

const disposabilityOptions = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

const lensTechnologyOptions = [
  { value: "hydrogel", label: "Hydrogel" },
  { value: "siliconeHydrogel", label: "Silicone Hydrogel" },
];

const prescriptionTypeOptions = [
  { value: "spherical", label: "Spherical" },
  { value: "toric", label: "Toric" },
  { value: "multifocal", label: "Multifocal" },
  { value: "cosmetic", label: "Cosmetic" },
];

const lensFeaturesOptions = [
  { value: "uvProtection", label: "UV Protection" },
  { value: "highOxygen", label: "High Oxygen Permeability" },
  { value: "siliconeHydrogel", label: "Silicone Hydrogel" },
  { value: "moistureRetention", label: "Moisture Retention" },
];

const featuresOptions = [
  { value: "comfort", label: "Enhanced Comfort" },
  { value: "breathable", label: "Breathable" },
  { value: "easyHandling", label: "Easy Handling" },
];

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "unisex", label: "Unisex" },
];

function ContactLens({ initialData = {}, mode = "add" }) {
  // Warn if model is not contactLens
  if (initialData?.model && initialData.model !== "contactLens") {
    console.warn(
      `Expected model "contactLens", but received "${initialData.model}". This data may be intended for another component (e.g., SpectacleLens).`
    );
  }
  const navigate = useNavigate();
  // State for toggle sections
  const [showSections, setShowSections] = useState({
    seoDetails: false,
    productDetails: false,
    productFeatures: false,
  });

  // State for modal and selected image
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState([]);
  // Fetch attribute data from API
  useEffect(() => {
    const fetchAttributes = async () => {
      try {
        setLoading(true);
        const attributeData = {};

        // Fetch brand
        const brandResponse = await productAttributeService.getAttributes(
          "brand"
        );
        console.log("Brand API response:", brandResponse);
        if (brandResponse.success) {
          attributeData.brands = brandResponse.data.map((item) => ({
            value: item._id,
            label: item.name,
          }));
        } else {
          console.error("Brand API failed:", brandResponse.message);
          toast.error("Failed to fetch brands");
        }

        // Fetch unit
        const unitResponse = await productAttributeService.getAttributes(
          "unit"
        );
        console.log("Unit API response:", unitResponse);
        if (unitResponse.success) {
          attributeData.units = unitResponse.data.map((item) => ({
            value: item._id,
            label: item.name,
          }));
        } else {
          console.error("Unit API failed:", unitResponse.message);
          toast.error("Failed to fetch units");
        }

        // Fetch disposability
        const disposabilityResponse =
          await productAttributeService.getAttributes("disposability");
        console.log("Disposability API response:", disposabilityResponse);
        if (disposabilityResponse.success) {
          attributeData.disposability = disposabilityResponse.data.map(
            (item) => ({
              value: item._id,
              label: item.name,
            })
          );
        } else {
          console.error(
            "Disposability API failed:",
            disposabilityResponse.message
          );
          toast.error("Failed to fetch disposability options");
        }

        // Fetch lensTechnology
        const lensTechnologyResponse =
          await productAttributeService.getAttributes("lensTechnology");
        console.log("Lens Technology API response:", lensTechnologyResponse);
        if (lensTechnologyResponse.success) {
          attributeData.lensTechnology = lensTechnologyResponse.data.map(
            (item) => ({
              value: item._id,
              label: item.name,
            })
          );
        } else {
          console.error(
            "Lens Technology API failed:",
            lensTechnologyResponse.message
          );
          toast.error("Failed to fetch lens technology options");
        }

        // Fetch prescriptionType
        const prescriptionTypeResponse =
          await productAttributeService.getAttributes("prescriptionType");
        console.log(
          "Prescription Type API response:",
          prescriptionTypeResponse
        );
        if (prescriptionTypeResponse.success) {
          attributeData.prescriptionType = prescriptionTypeResponse.data.map(
            (item) => ({
              value: item._id,
              label: item.name,
            })
          );
        } else {
          console.error(
            "Prescription Type API failed:",
            prescriptionTypeResponse.message
          );
          toast.error("Failed to fetch prescription type options");
        }

        // Fetch features
        const featuresResponse = await productAttributeService.getAttributes(
          "feature"
        ); // Changed to "feature"
        console.log("Features API response:", featuresResponse);
        if (featuresResponse.success && featuresResponse.data?.length > 0) {
          attributeData.features = featuresResponse.data.map((item) => ({
            value: item._id,
            label: item.name,
          }));
        } else {
          console.error(
            "Features API failed or returned empty data:",
            featuresResponse.message || "No data"
          );
          toast.error("Failed to fetch features");
        }

        // Update state
        setAttributeOptions({
          brands: attributeData.brands || brandOptions,
          units: attributeData.units || unitOptions,
          disposability: attributeData.disposability || disposabilityOptions,
          lensTechnology: attributeData.lensTechnology || lensTechnologyOptions,
          prescriptionType:
            attributeData.prescriptionType || prescriptionTypeOptions,
          features: attributeData.features || [],
        });
        console.log("Updated attributeOptions:", attributeData);
      } catch (error) {
        console.error("Error fetching attributes:", error);
        toast.error("Failed to load form options");
      } finally {
        setLoading(false);
      }
    };

    fetchAttributes();
  }, []);

  // State for loading
  const [loading, setLoading] = useState(false);

  // State for attribute options
  const [attributeOptions, setAttributeOptions] = useState({
    brands: brandOptions,
    units: unitOptions,
    disposability: disposabilityOptions,
    lensTechnology: lensTechnologyOptions,
    prescriptionType: prescriptionTypeOptions,
    features: featuresOptions,
  });
  useEffect(() => {
    const fetchAttributes = async () => {
      try {
        setLoading(true);

        // Define all API calls
        const apiCalls = [
          productAttributeService.getAttributes("brand"),
          productAttributeService.getAttributes("unit"),
          productAttributeService.getAttributes("disposability"),
          productAttributeService.getAttributes("lensTechnology"),
          productAttributeService.getAttributes("prescriptionType"),
          productAttributeService.getAttributes("features"),
        ];

        // Execute all API calls concurrently
        const [
          brandResponse,
          unitResponse,
          disposabilityResponse,
          lensTechnologyResponse,
          prescriptionTypeResponse,
          featuresResponse,
        ] = await Promise.all(apiCalls);

        // Update state for each response
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

        if (disposabilityResponse.success) {
          setAttributeOptions((prev) => ({
            ...prev,
            disposability: disposabilityResponse.data.map((item) => ({
              value: item._id,
              label: item.name,
            })),
          }));
        }

        if (lensTechnologyResponse.success) {
          setAttributeOptions((prev) => ({
            ...prev,
            lensTechnology: lensTechnologyResponse.data.map((item) => ({
              value: item._id,
              label: item.name,
            })),
          }));
        }

        if (prescriptionTypeResponse.success) {
          setAttributeOptions((prev) => ({
            ...prev,
            prescriptionType: prescriptionTypeResponse.data.map((item) => ({
              value: item._id,
              label: item.name,
            })),
          }));
        }

        if (featuresResponse.success) {
          setAttributeOptions((prev) => ({
            ...prev,
            features: featuresResponse.data.map((item) => ({
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

  const initialValues = {
    model: initialData?.model || "contactLens",
    HSNCode: initialData?.HSNCode || "",
    brand: initialData?.brand || "",
    sku: initialData?.sku || "",
    displayName: initialData?.displayName || "",
    disposability: initialData?.disposability || "",
    tax: initialData?.tax || "",
    unit: initialData?.unit || "",
    costPrice: initialData?.costPrice || "",
    resellerPrice: initialData?.resellerPrice || "",
    MRP: initialData?.MRP ? String(initialData.MRP) : "",
    discount: initialData?.discount || "",
    sellPrice: initialData?.sellPrice || "",
    incentiveAmount: initialData?.incentiveAmount || 0,
    oldBarcode: initialData?.oldBarcode || "",
    seoTitle: initialData?.seoTitle || "",
    seoDescription: initialData?.seoDescription || "",
    seoImage: initialData?.seoImage || null,
    productName: initialData?.productName || "",
    lensTechnology: initialData?.lensTechnology || "",
    lensMaterial: initialData?.lensMaterial || "",
    baseCurve: initialData?.baseCurve || "",
    dia: initialData?.dia || "",
    waterContent: initialData?.waterContent || "",
    expiry: initialData?.expiry || null,
    lensFeatures: initialData?.lensFeatures || [],
    prescriptionType: initialData?.prescriptionType || "",
    features: initialData?.features || [],
    gender: initialData?.gender || "",
    warranty: initialData?.warranty || "",
    description: initialData?.description || "",
    manageStock: initialData?.manageStock ?? false,
    inclusiveTax: initialData?.inclusiveTax ?? true,
    activeInERP: initialData?.activeInERP ?? true,
    activeInWebsite: initialData?.activeInWebsite ?? false,
    isB2B: initialData?.isB2B ?? false,
    photos: Array.isArray(initialData?.photos)
      ? initialData.photos
      : initialData?.photos
      ? [initialData.photos]
      : [],
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    console.log("Form submission triggered with values:", values); // Debug log
    setSubmitting(true);

    try {
      // Handle image upload for seoImage
      if (values.seoImage instanceof File) {
        console.log("Uploading seoImage:", values.seoImage.name);
        const res = await uploadImage(values.seoImage, values.seoImage.name);
        values.seoImage = `eyesdeal/website/image/seo/${values.seoImage.name}`; // Set the path
        console.log("seoImage uploaded, path:", values.seoImage);
      }

      // Prepare the payload
      const payload = {
        _id: initialData?._id,
        model: values.model || "contactLens",
        HSNCode: values.HSNCode || "",
        brand: values.brand || null, // Set to null for ObjectId
        sku: values.sku || "",
        displayName: values.displayName || "",
        disposability: values.disposability || null, // Set to null for ObjectId
        tax: parseFloat(values.tax) || 0,
        unit: values.unit || null, // Set to null for ObjectId
        costPrice: parseFloat(values.costPrice) || 0,
        resellerPrice: parseFloat(values.resellerPrice) || 0,
        MRP: parseFloat(values.MRP) || 0,
        discount: parseFloat(values.discount) || 0,
        sellPrice: parseFloat(values.sellPrice) || 0,
        incentiveAmount: parseFloat(values.incentiveAmount) || 0,
        oldBarcode: values.oldBarcode ? Number(values.oldBarcode) : null,
        seoTitle: values.seoTitle || "",
        seoDescription: values.seoDescription || "",
        seoImage: values.seoImage || "",
        productName: values.productName || "",
        lensTechnology: values.lensTechnology || null, // Set to null for ObjectId
        lensMaterial: values.lensMaterial || "",
        baseCurve: values.baseCurve || "",
        dia: values.dia || "",
        waterContent: values.waterContent || "",
        expiry: values.expiry ? Number(values.expiry) : null,
        lensFeatures: Array.isArray(values.lensFeatures)
          ? values.lensFeatures
          : values.lensFeatures
          ? [values.lensFeatures]
          : [],
        prescriptionType: values.prescriptionType || null, // Set to null for ObjectId
        features: Array.isArray(values.features)
          ? values.features
          : values.features
          ? [values.features]
          : [],
        gender: values.gender || "",
        warranty: values.warranty || "",
        description: values.description || "",
        manageStock: values.manageStock ?? false,
        inclusiveTax: values.inclusiveTax ?? true,
        activeInERP: values.activeInERP ?? true,
        activeInWebsite: values.activeInWebsite ?? false,
        isB2B: values.isB2B ?? false,
        photos: Array.isArray(values.photos)
          ? values.photos
          : values.photos
          ? [values.photos]
          : [],
        __t: "contactLens",
        storeFront: initialData?.storeFront || [],
      };

      console.log("Prepared payload:", payload); // Debug log

      if (mode === "edit") {
        console.log("Editing product ID:", initialData?._id);

        const response = await productViewService.updateProductData(
          initialData?._id,
          payload,
          "contactLens"
        );

        if (response.success) {
          console.log("Update successful:", response.data);
          toast.success("Product updated successfully");
          resetForm();
          const query = new URLSearchParams({
            model: payload.model || "contactLens",
            brand: payload.brand || "",
            status: "active",
          }).toString();
          navigate(`/products/view?${query}`);
        } else {
          console.log("Update failed:", response.message);
          toast.error(response.message || "Failed to update product");
        }
      } else {
        const response = await productService.addProduct(
          payload,
          "contactLens"
        );

        if (response.success) {
          console.log("Add successful:", response.data);
          toast.success("Product added successfully");
          resetForm();
          const query = new URLSearchParams({
            model: payload.model || "contactLens",
            brand: payload.brand || "",
            status: "active",
          }).toString();
          navigate(`/products/view?${query}`);
        } else {
          console.log("Add failed:", response.message);
          toast.error(response.message || "Failed to add product");
        }
      }
    } catch (error) {
      console.error("Error in product operation:", error);
      if (
        error.response?.data?.error?.includes("code: 11000") &&
        error.response?.data?.error?.includes("sku")
      ) {
        toast.error("SKU already exists. Please use a unique SKU.");
      } else if (
        error.response?.data?.message?.includes("Cast to ObjectId failed")
      ) {
        toast.error(
          "Invalid selection for one or more fields (e.g., Brand, Unit, Disposability, Lens Technology, Prescription Type). Please select valid options."
        );
      } else {
        toast.error("An error occurred while processing your request");
      }
    } finally {
      setSubmitting(false);
      console.log("Submission completed, isSubmitting:", false);
    }
  };

  return (
    <div className="p-0 mt-5 mx-auto">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize={true}
      >
        {({ setFieldValue, values, isSubmitting }) => (
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
                htmlFor="HSNCode"
              >
                HSN Code
              </label>
              <Field type="number" name="HSNCode" className="form-control" />
              <ErrorMessage
                name="HSNCode"
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
                  setFieldValue("brand", option ? option.value : null)
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
                htmlFor="disposability"
              >
                Disposability <span className="text-danger">*</span>
              </label>
              <Select
                name="disposability"
                options={attributeOptions.disposability}
                onChange={(option) =>
                  setFieldValue("disposability", option ? option.value : null)
                }
                value={attributeOptions.disposability.find(
                  (option) => option.value === values.disposability
                )}
                placeholder="Select..."
                classNamePrefix="react-select"
              />
              <ErrorMessage
                name="disposability"
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
                htmlFor="unit"
              >
                Unit <span className="text-danger">*</span>
              </label>
              <Select
                name="unit"
                options={attributeOptions.units}
                onChange={(option) =>
                  setFieldValue("unit", option ? option.value : null)
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
                <Field type="number" name="MRP" className="form-control" />{" "}
                {/* Changed to number */}
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
                <Field type="number" name="discount" className="form-control" />{" "}
                {/* Changed to number */}
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
                  {values.seoImage && typeof values.seoImage === "string" && (
                    <img
                      src={`${defalutImageBasePath}${values.seoImage}`}
                      alt="SEO Image"
                      style={{ maxHeight: "100px", marginTop: "10px" }}
                    />
                  )}
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
                    htmlFor="lensTechnology"
                  >
                    Lens Technology
                  </label>
                  <Select
                    name="lensTechnology"
                    options={attributeOptions.lensTechnology}
                    onChange={(option) =>
                      setFieldValue(
                        "lensTechnology",
                        option ? option.value : null
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
                    htmlFor="lensMaterial"
                  >
                    Lens Material
                  </label>
                  <Field
                    type="text"
                    name="lensMaterial"
                    className="form-control"
                  />
                  <ErrorMessage
                    name="lensMaterial"
                    component="div"
                    className="text-danger text-sm"
                  />
                </div>
                <div>
                  <label
                    className="form-label font-weight-600 text-sm font-medium"
                    htmlFor="baseCurve"
                  >
                    Base Curve
                  </label>
                  <Field
                    type="text"
                    name="baseCurve"
                    className="form-control"
                  />
                  <ErrorMessage
                    name="baseCurve"
                    component="div"
                    className="text-danger text-sm"
                  />
                </div>
                <div>
                  <label
                    className="form-label font-weight-600 text-sm font-medium"
                    htmlFor="dia"
                  >
                    DIA
                  </label>
                  <Field type="text" name="dia" className="form-control" />
                  <ErrorMessage
                    name="dia"
                    component="div"
                    className="text-danger text-sm"
                  />
                </div>
                <div>
                  <label
                    className="form-label font-weight-600 text-sm font-medium"
                    htmlFor="waterContent"
                  >
                    Water Content
                  </label>
                  <Field
                    type="text"
                    name="waterContent"
                    className="form-control"
                  />
                  <ErrorMessage
                    name="waterContent"
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
              </div>
            )}

            <p
              className="text-decoration-underline pointer mb-0"
              onClick={() => toggleSection("productFeatures")}
            >
              Product Features
            </p>
            {showSections.productFeatures && (
              <div className="d-flex flex-column gap-4">
                <div>
                  <label
                    className="form-label font-weight-600 text-sm font-medium"
                    htmlFor="lensFeatures"
                  >
                    Lens Features
                  </label>
                  <Select
                    name="lensFeatures"
                    isMulti
                    options={lensFeaturesOptions}
                    onChange={(options) =>
                      setFieldValue(
                        "lensFeatures",
                        options ? options.map((opt) => opt.value) : []
                      )
                    }
                    value={lensFeaturesOptions.filter((option) =>
                      values.lensFeatures.includes(option.value)
                    )}
                    placeholder="Select..."
                    classNamePrefix="react-select"
                  />
                  <ErrorMessage
                    name="lensFeatures"
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
                    options={attributeOptions.prescriptionType}
                    onChange={(option) =>
                      setFieldValue(
                        "prescriptionType",
                        option ? option.value : null
                      )
                    }
                    value={attributeOptions.prescriptionType.find(
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
                    isMulti
                    options={attributeOptions.features}
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
                    htmlFor="gender"
                  >
                    Gender
                  </label>
                  <Select
                    name="gender"
                    options={genderOptions}
                    onChange={(option) =>
                      setFieldValue("gender", option ? option.value : null)
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
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Submitting..."
                  : mode === "edit"
                  ? "Update"
                  : "Submit"}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default ContactLens;
