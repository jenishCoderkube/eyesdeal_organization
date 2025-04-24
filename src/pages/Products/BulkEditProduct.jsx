import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import * as XLSX from "xlsx";

// Validation schema
const validationSchema = Yup.object({
  productType: Yup.object().nullable().required("Product Type is required"),
  bulkUploadFile: Yup.mixed().required("File is required"),
});

// Dummy product type options
const productTypeOptions = [
  { value: "sunGlasses", label: "Sun Glasses" },
  { value: "eyeGlasses", label: "Eye Glasses" },
  { value: "contactLenses", label: "Contact Lenses" },
];

// Dummy product ranges based on product type
const productRangesByType = {
  sunGlasses: [
    { label: "1 - 1000", value: "1-1000" },
    { label: "1001 - 2000", value: "1001-2000" },
    { label: "2001 - 3000", value: "2001-3000" },
  ],
  eyeGlasses: [
    { label: "1 - 500", value: "1-500" },
    { label: "501 - 1000", value: "501-1000" },
    { label: "1001 - 1500", value: "1001-1500" },
  ],
  contactLenses: [
    { label: "1 - 1500", value: "1-1500" },
    { label: "1501 - 3000", value: "1501-3000" },
    { label: "3001 - 4439", value: "3001-4439" },
  ],
};

// Dummy data for Excel download (4 entries)
const dummyData = [
  {
    _id: "644400b2121900f79604304d",
    modelNumber: "FR-6807",
    colorNumber: "C8",
    gender: "Unisex",
    frameSize: "Medium",
    frameWidth: "135mm",
    frameDimensions: "50-20-145",
    weight: "25g",
    features: ["Lightweight", "Anti-glare"],
    oldBarcode: 2140,
    sku: "IG-FR-6807-C8",
    displayName: "I-gog Frames",
    HSNCode: "9003",
    brand: "I-Gog",
    unit: "1Pcs",
    warranty: "1 Year",
    tax: 12,
    description: "Premium eyeglasses",
    costPrice: 290,
    resellerPrice: 693,
    MRP: 990,
    discount: 0,
    sellPrice: 990,
    manageStock: true,
    inclusiveTax: true,
    incentiveAmount: 0,
    newBarcode: 605005,
    activeInERP: true,
    activeInWebsite: false,
    totalQuantity: 1,
  },
  {
    _id: "644400b2121900f79604304e",
    modelNumber: "SG-1234",
    colorNumber: "C1",
    gender: "Male",
    frameSize: "Large",
    frameWidth: "140mm",
    frameDimensions: "52-22-150",
    weight: "30g",
    features: ["UV Protection", "Polarized"],
    oldBarcode: 2141,
    sku: "SG-1234-C1",
    displayName: "SunGuard Sunglasses",
    HSNCode: "9004",
    brand: "SunGuard",
    unit: "1Pcs",
    warranty: "6 Months",
    tax: 18,
    description: "Stylish sunglasses",
    costPrice: 350,
    resellerPrice: 800,
    MRP: 1200,
    discount: 10,
    sellPrice: 1080,
    manageStock: true,
    inclusiveTax: true,
    incentiveAmount: 50,
    newBarcode: 605006,
    activeInERP: true,
    activeInWebsite: true,
    totalQuantity: 5,
  },
  {
    _id: "644400b2121900f79604304f",
    modelNumber: "CL-5678",
    colorNumber: "Clear",
    gender: "Unisex",
    frameSize: "N/A",
    frameWidth: "N/A",
    frameDimensions: "N/A",
    weight: "10g",
    features: ["Daily Wear", "High Oxygen"],
    oldBarcode: 2142,
    sku: "CL-5678",
    displayName: "ClearVision Contact Lenses",
    HSNCode: "9001",
    brand: "ClearVision",
    unit: "Pair",
    warranty: "N/A",
    tax: 5,
    description: "Comfortable contact lenses",
    costPrice: 200,
    resellerPrice: 450,
    MRP: 600,
    discount: 0,
    sellPrice: 600,
    manageStock: true,
    inclusiveTax: false,
    incentiveAmount: 0,
    newBarcode: 605007,
    activeInERP: true,
    activeInWebsite: true,
    totalQuantity: 10,
  },
  {
    _id: "644400b2121900f796043050",
    modelNumber: "FR-8901",
    colorNumber: "C2",
    gender: "Female",
    frameSize: "Small",
    frameWidth: "130mm",
    frameDimensions: "48-18-140",
    weight: "20g",
    features: ["Flexible", "Lightweight"],
    oldBarcode: 2143,
    sku: "IG-FR-8901-C2",
    displayName: "I-gog Fashion Frames",
    HSNCode: "9003",
    brand: "I-Gog",
    unit: "1Pcs",
    warranty: "1 Year",
    tax: 12,
    description: "Trendy eyeglasses",
    costPrice: 320,
    resellerPrice: 750,
    MRP: 1100,
    discount: 5,
    sellPrice: 1045,
    manageStock: true,
    inclusiveTax: true,
    incentiveAmount: 20,
    newBarcode: 605008,
    activeInERP: true,
    activeInWebsite: false,
    totalQuantity: 3,
  },
];

// Function to download Excel file
const downloadExcel = (range, productType) => {
  // Filter dummy data based on product type
  const filteredData = dummyData.filter((item) => {
    if (productType === "sunGlasses") return item.HSNCode === "9004";
    if (productType === "eyeGlasses") return item.HSNCode === "9003";
    if (productType === "contactLenses") return item.HSNCode === "9001";
    return true;
  });

  // Prepare data for Excel
  const worksheetData = filteredData.map((item) => ({
    ID: item._id,
    ModelNumber: item.modelNumber,
    ColorNumber: item.colorNumber,
    Gender: item.gender,
    FrameSize: item.frameSize,
    FrameWidth: item.frameWidth,
    FrameDimensions: item.frameDimensions,
    Weight: item.weight,
    Features: item.features.join(", "),
    OldBarcode: item.oldBarcode,
    SKU: item.sku,
    DisplayName: item.displayName,
    HSNCode: item.HSNCode,
    Brand: item.brand,
    Unit: item.unit,
    Warranty: item.warranty,
    Tax: item.tax,
    Description: item.description,
    CostPrice: item.costPrice,
    ResellerPrice: item.resellerPrice,
    MRP: item.MRP,
    Discount: item.discount,
    SellPrice: item.sellPrice,
    TotalQuantity: item.totalQuantity,
  }));

  // Create worksheet and workbook
  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Products");

  // Download the Excel file
  XLSX.writeFile(workbook, `Products_${productType}_${range}.xlsx`);
};

const BulkEditProduct = () => {
  // Formik setup
  const formik = useFormik({
    initialValues: {
      productType: null,
      bulkUploadFile: null,
    },
    validationSchema,
    onSubmit: (values) => {
      console.log("Bulk Upload Products:", {
        productType: values.productType,
        file: values.bulkUploadFile,
      });
      formik.resetForm();
    },
  });

  // Handle file input change
  const handleFileChange = (event) => {
    const file = event.currentTarget.files[0];
    formik.setFieldValue("bulkUploadFile", file);
  };

  // Get product ranges based on selected product type
  const selectedProductType = formik.values.productType?.value;
  const productRanges = selectedProductType
    ? productRangesByType[selectedProductType] || []
    : [];

  return (
    <div className="container-fluid px-4 py-8">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10">
          <h1 className="h2 text-dark fw-bold my-4">Bulk Edit Product</h1>
          <div className="card shadow-sm mb-4 border-0">
            <div className="card-body p-4">
              <form
                onSubmit={formik.handleSubmit}
                className="d-flex flex-column"
                style={{ gap: "1rem" }}
              >
                {/* Product Type Selection */}
                <div className="w-100">
                  <label
                    className="form-label font-weight-500"
                    htmlFor="productType"
                  >
                    Product Type <span className="text-danger">*</span>
                  </label>
                  <Select
                    options={productTypeOptions}
                    value={formik.values.productType}
                    onChange={(option) =>
                      formik.setFieldValue("productType", option)
                    }
                    onBlur={() => formik.setFieldTouched("productType", true)}
                    placeholder="Select..."
                    classNamePrefix="react-select"
                    className={
                      formik.touched.productType && formik.errors.productType
                        ? "is-invalid"
                        : ""
                    }
                  />
                  {formik.touched.productType && formik.errors.productType && (
                    <div className="text-danger mt-1">
                      {formik.errors.productType}
                    </div>
                  )}
                </div>

                {/* Conditional Rendering for Product Ranges, File Upload, and Submit Button */}
                {selectedProductType && (
                  <>
                    {/* Dynamic Product Range Buttons */}
                    {productRanges.length > 0 && (
                      <div className="w-100">
                        <label className="form-label fw-medium">
                          Product Ranges
                        </label>
                        <div className="d-flex flex-wrap gap-2">
                          {productRanges.map((range) => (
                            <button
                              key={range.value}
                              type="button"
                              className="btn text-white"
                              style={{
                                backgroundColor: "#6366f1",
                              }}
                              onMouseOver={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "#4f46e5")
                              }
                              onMouseOut={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "#6366f1")
                              }
                              onClick={() =>
                                downloadExcel(range.value, selectedProductType)
                              }
                            >
                              {range.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* File Upload */}
                    <div className="w-100">
                      <label
                        className="form-label fw-medium"
                        htmlFor="bulkUploadFile"
                      >
                        File <span className="text-danger">*</span>
                      </label>
                      <input
                        type="file"
                        name="bulkUploadFile"
                        className={`form-control ${
                          formik.touched.bulkUploadFile &&
                          formik.errors.bulkUploadFile
                            ? "is-invalid"
                            : ""
                        }`}
                        onChange={handleFileChange}
                        onBlur={formik.handleBlur}
                      />
                      {formik.touched.bulkUploadFile &&
                        formik.errors.bulkUploadFile && (
                          <div className="invalid-feedback">
                            {formik.errors.bulkUploadFile}
                          </div>
                        )}
                    </div>

                    {/* Submit Button */}
                  </>
                )}
                <div>
                  <button
                    type="submit"
                    className="btn text-white"
                    style={{ backgroundColor: "#6366f1" }}
                    disabled={formik.isSubmitting}
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkEditProduct;
