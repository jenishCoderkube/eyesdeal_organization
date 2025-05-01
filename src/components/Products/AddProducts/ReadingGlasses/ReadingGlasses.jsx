import React, { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import AssetSelector from "../EyeGlasses/AssetSelector";
import { productAttributeService } from "../../../../services/productAttributeService";
import { toast } from "react-toastify";
import { productService } from "../../../../services/productService";
import { defalutImageBasePath, uploadImage } from "../../../../utils/constants"; // Adjust the path as necessary
import { IoClose } from "react-icons/io5";
// Validation schema using Yup
const validationSchema = Yup.object({
  model: Yup.string().required("Model is required"),
  brand: Yup.string().required("Brand is required"),
  sku: Yup.string().required("SKU is required"),
  displayName: Yup.string().required("Display Name is required"),
  HSNCode: Yup.string().nullable(),
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
  seoTitle: Yup.string(),
  seoDescription: Yup.string(),
  seoImage: Yup.mixed(),
  warranty: Yup.string(),
  description: Yup.string(),
  // features: Yup.string(),
  gender: Yup.string(),
  modelNumber: Yup.string(),
  colorNumber: Yup.string(),
  lensTechnology: Yup.string(),
  readingPower: Yup.string(),
  frameType: Yup.string(),
  frameShape: Yup.string(),
  frameStyle: Yup.string(),
  templeMaterial: Yup.string(),
  frameMaterial: Yup.string(),
  frameColor: Yup.string(),
  templeColor: Yup.string(),
  prescriptionType: Yup.string(),
  frameCollection: Yup.string(),
  frameSize: Yup.string().required("Frame Size is required"),
  frameWidth: Yup.string(),
  frameDimensions: Yup.string(),
  weight: Yup.string(),
  manageStock: Yup.boolean(),
  inclusiveTax: Yup.boolean(),
  activeInERP: Yup.boolean(),
  activeInWebsite: Yup.boolean(),
  photos: Yup.string(),
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

const lensTechnologyOptions = [
  { value: "polycarbonate", label: "Polycarbonate" },
  { value: "highIndex", label: "High Index" },
  { value: "plastic", label: "Plastic" },
];

const readingPowerOptions = [
  { value: "+1.00", label: "+1.00" },
  { value: "+1.25", label: "+1.25" },
  { value: "+1.50", label: "+1.50" },
  { value: "+1.75", label: "+1.75" },
  { value: "+2.00", label: "+2.00" },
  { value: "+2.25", label: "+2.25" },
  { value: "+2.50", label: "+2.50" },
  { value: "+2.75", label: "+2.75" },
  { value: "+3.00", label: "+3.00" },
  { value: "+3.25", label: "+3.25" },
  { value: "+3.50", label: "+3.50" },
  { value: "+3.75", label: "+3.75" },
  { value: "+4.00", label: "+4.00" },
];

const frameTypeOptions = [
  { value: "fullRim", label: "Full Rim" },
  { value: "halfRim", label: "Half Rim" },
  { value: "rimless", label: "Rimless" },
];

const frameShapeOptions = [
  { value: "rectangle", label: "Rectangle" },
  { value: "round", label: "Round" },
  { value: "catEye", label: "Cat Eye" },
  { value: "aviator", label: "Aviator" },
];

const frameStyleOptions = [
  { value: "classic", label: "Classic" },
  { value: "modern", label: "Modern" },
  { value: "trendy", label: "Trendy" },
];

const templeMaterialOptions = [
  { value: "metal", label: "Metal" },
  { value: "plastic", label: "Plastic" },
  { value: "acetate", label: "Acetate" },
];

const frameMaterialOptions = [
  { value: "metal", label: "Metal" },
  { value: "plastic", label: "Plastic" },
  { value: "acetate", label: "Acetate" },
  { value: "titanium", label: "Titanium" },
];

const frameColorOptions = [
  { value: "black", label: "Black" },
  { value: "brown", label: "Brown" },
  { value: "blue", label: "Blue" },
  { value: "red", label: "Red" },
];

const templeColorOptions = [
  { value: "black", label: "Black" },
  { value: "brown", label: "Brown" },
  { value: "blue", label: "Blue" },
  { value: "red", label: "Red" },
];

const prescriptionTypeOptions = [
  { value: "singleVision", label: "Single Vision" },
  { value: "nonPrescription", label: "Non-Prescription" },
];

const frameCollectionOptions = [
  { value: "premium", label: "Premium" },
  { value: "standard", label: "Standard" },
  { value: "budget", label: "Budget" },
];

const frameSizeOptions = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
];

const featuresOptions = [
  { value: "lightweight", label: "Lightweight" },
  { value: "durable", label: "Durable" },
  { value: "flexible", label: "Flexible" },
];

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "unisex", label: "Unisex" },
];

function ReadingGlasses({ initialData = {}, mode = "add" }) {
  // Warn if model is not readingGlasses
  if (initialData?.model && initialData.model !== "readingGlasses") {
    console.warn(
      `Expected model "readingGlasses", but received "${initialData.model}". This data may be intended for another component (e.g., EyeGlasses).`
    );
  }

  // State for toggle sections
  const [showSections, setShowSections] = useState({
    seoDetails: false,
    productDetails: false,
    frameDetails: false,
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

  const [loading, setLoading] = useState(false);

  // State for attribute options
  const [attributeOptions, setAttributeOptions] = useState({
    brands: [],
    units: [],
    lensTechnology: [],
    readingPower: [],
    frameType: [],
    frameShape: [],
    frameStyle: [],
    templeMaterial: [],
    frameMaterial: [],
    frameColor: [],
    templeColor: [],
    prescriptionType: [],
    frameCollection: [],
    frameSize: [],
    features: [],
    gender: [],
  });

  // Fetch attribute data from API
  useEffect(() => {
    const fetchAttributes = async () => {
      try {
        setLoading(true);
        const attributeData = {};

        // Fetching attributes from the respective endpoints
        const brandResponse = await productAttributeService.getAttributes(
          "brand"
        );
        const unitResponse = await productAttributeService.getAttributes(
          "unit"
        );
        const lensTechnologyResponse =
          await productAttributeService.getAttributes("lensTechnology");
        const readingPowerResponse =
          await productAttributeService.getAttributes("readingPower");
        const frameTypeResponse = await productAttributeService.getAttributes(
          "frameType"
        );
        const frameShapeResponse = await productAttributeService.getAttributes(
          "frameShape"
        );
        const frameStyleResponse = await productAttributeService.getAttributes(
          "frameStyle"
        );
        const templeMaterialResponse =
          await productAttributeService.getAttributes("material"); // Using /master/material
        const frameMaterialResponse =
          await productAttributeService.getAttributes("material"); // Using /master/material
        const frameColorResponse = await productAttributeService.getAttributes(
          "color"
        ); // Using /master/color
        const templeColorResponse = await productAttributeService.getAttributes(
          "color"
        ); // Using /master/color
        const prescriptionTypeResponse =
          await productAttributeService.getAttributes("prescriptionType");
        const frameCollectionResponse =
          await productAttributeService.getAttributes("collection");
        const frameSizeResponse = await productAttributeService.getAttributes(
          "frameSize"
        );
        const featuresResponse = await productAttributeService.getAttributes(
          "feature"
        );
        const genderResponse = await productAttributeService.getAttributes(
          "gender"
        );

        // Mapping responses to state
        if (brandResponse.success) {
          attributeData.brand = brandResponse.data.map((item) => ({
            value: item._id,
            label: item.name,
          }));
        }
        if (unitResponse.success) {
          attributeData.unit = unitResponse.data.map((item) => ({
            value: item._id,
            label: item.name,
          }));
        }
        if (lensTechnologyResponse.success) {
          attributeData.lensTechnology = lensTechnologyResponse.data.map(
            (item) => ({ value: item._id, label: item.name })
          );
        }
        if (readingPowerResponse.success) {
          attributeData.readingPower = readingPowerResponse.data.map(
            (item) => ({ value: item._id, label: item.name })
          );
        }
        if (frameTypeResponse.success) {
          attributeData.frameType = frameTypeResponse.data.map((item) => ({
            value: item._id,
            label: item.name,
          }));
        }
        if (frameShapeResponse.success) {
          attributeData.frameShape = frameShapeResponse.data.map((item) => ({
            value: item._id,
            label: item.name,
          }));
        }
        if (frameStyleResponse.success) {
          attributeData.frameStyle = frameStyleResponse.data.map((item) => ({
            value: item._id,
            label: item.name,
          }));
        }
        if (templeMaterialResponse.success) {
          attributeData.templeMaterial = templeMaterialResponse.data.map(
            (item) => ({ value: item._id, label: item.name })
          );
        }
        if (frameMaterialResponse.success) {
          attributeData.frameMaterial = frameMaterialResponse.data.map(
            (item) => ({ value: item._id, label: item.name })
          );
        }
        if (frameColorResponse.success) {
          attributeData.frameColor = frameColorResponse.data.map((item) => ({
            value: item._id,
            label: item.name,
          }));
        }
        if (templeColorResponse.success) {
          attributeData.templeColor = templeColorResponse.data.map((item) => ({
            value: item._id,
            label: item.name,
          }));
        }
        if (prescriptionTypeResponse.success) {
          attributeData.prescriptionType = prescriptionTypeResponse.data.map(
            (item) => ({ value: item._id, label: item.name })
          );
        }
        if (frameCollectionResponse.success) {
          attributeData.frameCollection = frameCollectionResponse.data.map(
            (item) => ({ value: item._id, label: item.name })
          );
        }
        if (frameSizeResponse.success) {
          attributeData.frameSize = frameSizeResponse.data.map((item) => ({
            value: item._id,
            label: item.name,
          }));
        }
        if (featuresResponse.success) {
          attributeData.features = featuresResponse.data.map((item) => ({
            value: item._id,
            label: item.name,
          }));
        }
        if (genderResponse.success) {
          attributeData.gender = genderResponse.data.map((item) => ({
            value: item._id,
            label: item.name,
          }));
        }

        // Set attribute options
        setAttributeOptions({
          brands: attributeData.brand || [],
          units: attributeData.unit || [],
          lensTechnology: attributeData.lensTechnology || [],
          readingPower: attributeData.readingPower || [],
          frameType: attributeData.frameType || [],
          frameShape: attributeData.frameShape || [],
          frameStyle: attributeData.frameStyle || [],
          templeMaterial: attributeData.templeMaterial || [],
          frameMaterial: attributeData.frameMaterial || [],
          frameColor: attributeData.frameColor || [],
          templeColor: attributeData.templeColor || [],
          prescriptionType: attributeData.prescriptionType || [],
          frameCollection: attributeData.frameCollection || [],
          frameSize: attributeData.frameSize || [],
          features: attributeData.features || [],
          gender: attributeData.gender || [],
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

  // Function to return static options based on attribute type
  const getStaticOptions = (type) => {
    switch (type) {
      case "brand":
        return [
          { value: "brand1", label: "Brand 1" },
          { value: "brand2", label: "Brand 2" },
          { value: "brand3", label: "Brand 3" },
        ];
      case "unit":
        return [
          { value: "piece", label: "Piece" },
          { value: "pair", label: "Pair" },
        ];
      case "lensTechnology":
        return [
          { value: "polycarbonate", label: "Polycarbonate" },
          { value: "highIndex", label: "High Index" },
          { value: "plastic", label: "Plastic" },
        ];
      case "templeMaterial":
        return [
          { value: "metal", label: "Metal" },
          { value: "plastic", label: "Plastic" },
          { value: "acetate", label: "Acetate" },
        ];
      case "frameMaterial":
        return [
          { value: "metal", label: "Metal" },
          { value: "plastic", label: "Plastic" },
          { value: "acetate", label: "Acetate" },
          { value: "titanium", label: "Titanium" },
        ];
      case "frameColor":
        return [
          { value: "black", label: "Black" },
          { value: "brown", label: "Brown" },
          { value: "blue", label: "Blue" },
          { value: "red", label: "Red" },
        ];
      case "templeColor":
        return [
          { value: "black", label: "Black" },
          { value: "brown", label: "Brown" },
          { value: "blue", label: "Blue" },
          { value: "red", label: "Red" },
        ];
      case "frameCollection":
        return [
          { value: "premium", label: "Premium" },
          { value: "standard", label: "Standard" },
          { value: "budget", label: "Budget" },
        ];
      case "frameSize":
        return [
          { value: "small", label: "Small" },
          { value: "medium", label: "Medium" },
          { value: "large", label: "Large" },
        ];
      // Add other cases for remaining attribute types...
      default:
        return [];
    }
  };

  // Toggle section visibility
  const toggleSection = (section) => {
    setShowSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Initial form values
  const initialValues = {
    model: initialData?.model || "readingGlasses",
    brand: initialData?.brand || "",
    sku: initialData?.sku || "",
    displayName: initialData?.displayName || "",
    HSNCode: initialData?.HSNCode || "",
    tax: initialData?.tax || "",
    unit: initialData?.unit || "",
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
    warranty: initialData?.warranty || "",
    description: initialData?.description || "",
    features: initialData?.features || "",
    gender: initialData?.gender || "",
    modelNumber: initialData?.modelNumber || "",
    colorNumber: initialData?.colorNumber || "",
    lensTechnology: initialData?.lensTechnology || "",
    readingPower: initialData?.readingPower || "",
    frameType: initialData?.frameType || "",
    frameShape: initialData?.frameShape || "",
    frameStyle: initialData?.frameStyle || "",
    templeMaterial: initialData?.templeMaterial || "",
    frameMaterial: initialData?.frameMaterial || "",
    frameColor: initialData?.frameColor || "",
    templeColor: initialData?.templeColor || "",
    prescriptionType: initialData?.prescriptionType || "",
    frameCollection: initialData?.frameCollection || "",
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
        ...values,
        features: Array.isArray(values.features)
          ? values.features
          : [values.features],
        photos: Array.isArray(values.photos)
          ? values.photos
          : [values.photos].filter(Boolean),
      };

      // Call the appropriate API based on mode
      let response;
      if (mode === "edit") {
        console.log("Editing product ID:", initialData?.id);
        response = await productService.updateEyeGlasses(
          initialData?.id,
          payload
        );
      } else {
        response = await productService.addProduct(payload, "readingGlasses");
      }

      if (response.success) {
        toast.success(
          `Product ${mode === "edit" ? "updated" : "added"} successfully`
        );
        resetForm();
        console.log(
          `${mode === "edit" ? "Update" : "Add"} response:`,
          response.data
        );
      } else {
        toast.error(
          response.message ||
            `Failed to ${mode === "edit" ? "update" : "add"} product`
        );
      }
    } catch (error) {
      console.error("Error in product operation:", error);
      toast.error("An error occurred while processing your request");
    } finally {
      setSubmitting(false);
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
                    isMulti
                    onChange={(options) =>
                      setFieldValue(
                        "features",
                        options ? options.map((option) => option.value) : []
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
                    htmlFor="readingPower"
                  >
                    Reading Power
                  </label>
                  <Select
                    name="readingPower"
                    options={readingPowerOptions}
                    onChange={(option) =>
                      setFieldValue("readingPower", option ? option.value : "")
                    }
                    value={readingPowerOptions.find(
                      (option) => option.value === values.readingPower
                    )}
                    placeholder="Select..."
                    classNamePrefix="react-select"
                  />
                  <ErrorMessage
                    name="readingPower"
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
                    options={attributeOptions.frameType}
                    onChange={(option) =>
                      setFieldValue("frameType", option ? option.value : "")
                    }
                    value={attributeOptions.frameType.find(
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
                    options={attributeOptions.frameShape}
                    onChange={(option) =>
                      setFieldValue("frameShape", option ? option.value : "")
                    }
                    value={attributeOptions.frameShape.find(
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
                    options={attributeOptions.frameStyle}
                    onChange={(option) =>
                      setFieldValue("frameStyle", option ? option.value : "")
                    }
                    value={attributeOptions.frameStyle.find(
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
                    options={attributeOptions.templeMaterial}
                    onChange={(option) =>
                      setFieldValue(
                        "templeMaterial",
                        option ? option.value : ""
                      )
                    }
                    value={attributeOptions.templeMaterial.find(
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
                    options={attributeOptions.frameMaterial}
                    onChange={(option) =>
                      setFieldValue("frameMaterial", option ? option.value : "")
                    }
                    value={attributeOptions.frameMaterial.find(
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
                    options={attributeOptions.frameColor}
                    onChange={(option) =>
                      setFieldValue("frameColor", option ? option.value : "")
                    }
                    value={attributeOptions.frameColor.find(
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
                    options={attributeOptions.templeColor}
                    onChange={(option) =>
                      setFieldValue("templeColor", option ? option.value : "")
                    }
                    value={attributeOptions.templeColor.find(
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
                        option ? option.value : ""
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
                    htmlFor="frameCollection"
                  >
                    Frame Collection
                  </label>
                  <Select
                    name="frameCollection"
                    options={attributeOptions.frameCollection}
                    onChange={(option) =>
                      setFieldValue(
                        "frameCollection",
                        option ? option.value : ""
                      )
                    }
                    value={attributeOptions.frameCollection.find(
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
                    htmlFor="frameSize"
                  >
                    Frame Size <span className="text-danger">*</span>
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
                  <div className="text-center text-muted">
                    No images available.
                  </div>
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

export default ReadingGlasses;
