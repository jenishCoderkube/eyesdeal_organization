import React, { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AssetSelector from "../EyeGlasses/AssetSelector";
import { productAttributeService } from "../../../../services/productAttributeService";
import { productService } from "../../../../services/productService";
import { defalutImageBasePath, uploadImage } from "../../../../utils/constants";
import { toast } from "react-toastify";
import { IoClose } from "react-icons/io5";
// Validation schema using Yup
const validationSchema = Yup.object({
  model: Yup.string().required("Model is required"),
  oldBarcode: Yup.string().nullable(),
  brand: Yup.string().required("Brand is required"),
  sku: Yup.string().required("SKU is required"),
  displayName: Yup.string().required("Display Name is required"),
  HSNCode: Yup.string().required("HSN Code is required"),
  material: Yup.string().required("Material is required"),
  manufactureDate: Yup.date()
    .required("Manufacture Date is required")
    .nullable(),
  expiryDate: Yup.date()
    .required("Expiry Date is required")
    .nullable()
    .test(
      "is-after-manufacture",
      "Expiry Date must be after Manufacture Date",
      function (value) {
        const manufactureDate = this.resolve(Yup.ref("manufactureDate"));
        if (!value || !manufactureDate) return true;
        return new Date(value) > new Date(manufactureDate);
      }
    ),
  unit: Yup.string().required("Unit is required"),
  warranty: Yup.string(),
  description: Yup.string().required("Description is required"),
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
  seoTitle: Yup.string(),
  seoDescription: Yup.string(),
  seoImage: Yup.mixed(),
  manageStock: Yup.boolean(),
  inclusiveTax: Yup.boolean(),
  activeInERP: Yup.boolean(),
  activeInWebsite: Yup.boolean(),
  photos: Yup.string(),
});

// Options for react-select
const unitOptions = [
  { value: "bottle", label: "Bottle" },
  { value: "ml", label: "ml" },
];

const brandOptions = [
  { value: "brand1", label: "Brand 1" },
  { value: "brand2", label: "Brand 2" },
  { value: "brand3", label: "Brand 3" },
];

function ContactSolutions({ initialData = {}, mode = "add" }) {
  // Warn if model is not contactSolutions
  if (initialData?.model && initialData.model !== "contactSolutions") {
    console.warn(
      `Expected model "contactSolutions", but received "${initialData.model}". This data may be intended for another component (e.g., EyeGlasses).`
    );
  }

  // State for toggle sections
  const [showSections, setShowSections] = useState({
    seoDetails: false,
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

  // State for dynamic options
  const [attributeOptions, setAttributeOptions] = useState({
    brands: [],
    units: [],
  });

  // Fetch attribute data from API
  useEffect(() => {
    const fetchAttributes = async () => {
      try {
        const brandResponse = await productAttributeService.getAttributes(
          "brand"
        );
        const unitResponse = await productAttributeService.getAttributes(
          "unit"
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
      } catch (error) {
        console.error("Error fetching attributes:", error);
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
    model: initialData?.model || "contactSolutions",
    oldBarcode: initialData?.barcode || "",
    brand: initialData?.brand || "",
    sku: initialData?.sku || "",
    displayName: initialData?.displayName || "",
    HSNCode: initialData?.HSNCode || "",
    material: initialData?.material || "",
    manufactureDate: initialData?.manufactureDate
      ? new Date(initialData.manufactureDate)
      : null,
    expiryDate: initialData?.expiryDate
      ? new Date(initialData.expiryDate)
      : null,
    unit: initialData?.unit || "",
    warranty: initialData?.warranty || "",
    description: initialData?.description || "",
    tax: initialData?.tax || "",
    costPrice: initialData?.costPrice || "",
    resellerPrice: initialData?.resellerPrice || "",
    MRP: initialData?.mrp ? String(initialData.mrp) : "",
    discount: initialData?.discount || "",
    sellPrice: initialData?.sellPrice || "",
    incentiveAmount: initialData?.incentiveAmount || 0,
    seoTitle: initialData?.seoTitle || "",
    seoDescription: initialData?.seoDescription || "",
    seoImage: initialData?.seoImage || null,
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
    setSubmitting(true);
    console.log("Form values before submission:", values); // Log the form values

    try {
      // Handle image upload for seoImage
      if (values.seoImage instanceof File) {
        const res = await uploadImage(values.seoImage, values.seoImage.name);
        values.seoImage = `eyesdeal/website/image/seo/${values.seoImage.name}`; // Set the path
      }

      // Prepare the payload
      const payload = {
        ...values,
        manufactureDate: values.manufactureDate
          ? values.manufactureDate.toISOString()
          : null, // Ensure date is in ISO format
        expiryDate: values.expiryDate ? values.expiryDate.toISOString() : null, // Ensure date is in ISO format
        oldBarcode: values.oldBarcode ? Number(values.oldBarcode) : null,
        photos: Array.isArray(values.photos)
          ? values.photos
          : [values.photos].filter(Boolean),
      };

      console.log("Payload being sent:", payload); // Log the payload

      let response;
      if (mode === "edit") {
        response = await productService.updateProduct(
          "contactSolutions",
          initialData?.id,
          payload
        );
        if (response.success) {
          toast.success("Product updated successfully");
          resetForm();
        } else {
          console.error("Update failed:", response); // Log the response for debugging
          toast.error(response.message || "Failed to update product");
        }
      } else {
        response = await productService.addProduct(payload, "contactSolutions");
        if (response.success) {
          toast.success("Product added successfully");
          resetForm();
        } else {
          console.error("Add failed:", response); // Log the response for debugging
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
                htmlFor="material"
              >
                Material <span className="text-danger">*</span>
              </label>
              <Field type="text" name="material" className="form-control" />
              <ErrorMessage
                name="material"
                component="div"
                className="text-danger text-sm"
              />
            </div>

            <div>
              <label
                className="form-label font-weight-600 text-sm font-medium"
                htmlFor="manufactureDate"
              >
                Manufacture Date <span className="text-danger">*</span>
              </label>
              <DatePicker
                selected={values.manufactureDate}
                onChange={(date) => setFieldValue("manufactureDate", date)}
                dateFormat="MM/dd/yyyy"
                className="form-control"
                placeholderText="Select date"
                isClearable
              />
              <ErrorMessage
                name="manufactureDate"
                component="div"
                className="text-danger text-sm"
              />
            </div>

            <div>
              <label
                className="form-label font-weight-600 text-sm font-medium"
                htmlFor="expiryDate"
              >
                Expiry Date <span className="text-danger">*</span>
              </label>
              <DatePicker
                selected={values.expiryDate}
                onChange={(date) => setFieldValue("expiryDate", date)}
                dateFormat="MM/dd/yyyy"
                className="form-control"
                placeholderText="Select date"
                isClearable
              />
              <ErrorMessage
                name="expiryDate"
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
                Description <span className="text-danger">*</span>
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

export default ContactSolutions;
