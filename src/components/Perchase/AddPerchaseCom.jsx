import React, { useState } from "react";
import "../../assets/css/Sale/sale_style.css";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import Select from "react-select";
import { useNavigate } from "react-router-dom";

const AddPerchaseCom = () => {
  const [formData, setFormData] = useState({
    vendor: null,
    invoiceNumber: "",
    invoiceDate: new Date("2025-03-31"),
    isDelivered: true,
    product: null,
    store: { value: "elite-hospital-27", label: "ELITE HOSPITAL / 27" },
    totalQuantity: 0,
    totalAmount: 0,
    totalTax: 0,
    totalDiscount: 0,
    flatDiscount: 0,
    otherCharges: 0,
    netAmount: 0,
    notes: "",
  });

  const [products, setProducts] = useState([]);
  const [errors, setErrors] = useState({
    vendor: "",
    invoiceNumber: "",
    invoiceDate: "", // Added invoiceDate to errors state
    product: "",
  });

  const navigate = useNavigate();

  const vendorOptions = [
    { value: "676447c0afa086e21cefe21d", label: "METRO OPTICAL DELHI" },
    { value: "vendor2", label: "Vendor 2" },
  ];

  const productOptions = [
    { value: "prod1", label: "Product 1" },
    { value: "prod2", label: "Product 2" },
  ];

  const storeOptions = [
    { value: "elite-hospital-27", label: "ELITE HOSPITAL / 27" },
    { value: "store2", label: "Store 2" },
  ];

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectChange = (name, option) => {
    setFormData((prev) => ({ ...prev, [name]: option }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.vendor) {
      newErrors.vendor = "Vendor is required";
    }
    if (!formData.invoiceNumber.trim()) {
      newErrors.invoiceNumber = "Invoice Number is required";
    }
    if (!formData.invoiceDate) {
      newErrors.invoiceDate = "Invoice Date is required";
    }
    if (products.length === 0 && !formData.product) {
      newErrors.product = "At least one product must be selected";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddProduct = () => {
    if (formData.product) {
      setProducts((prev) => [
        ...prev,
        {
          id: formData.product.value,
          barcode: `BAR${formData.product.value}`,
          sku: `SKU${formData.product.value}`,
          quantity: 1,
          mrp: 100,
          purRate: 80,
          discType: "percentage",
          discRate: 0,
          discAmount: 0,
          tax: 5,
          taxAmount: 5,
          totalDisc: 0,
          totalAmount: 85,
        },
      ]);
      setFormData((prev) => ({ ...prev, product: null }));
      setErrors((prev) => ({ ...prev, product: "" }));
      setFormData((prev) => ({
        ...prev,
        totalQuantity: prev.totalQuantity + 1,
        totalAmount: prev.totalAmount + 85,
        totalTax: prev.totalTax + 5,
        netAmount: prev.netAmount + 85,
      }));
    } else {
      setErrors((prev) => ({ ...prev, product: "Please select a product" }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("Form submitted:", { ...formData, products });
    }
  };

  return (
    <div className="container-fluid p-2">
      <form onSubmit={handleSubmit}>
        <div className="row px-3">
          {/* Left Section */}
          <div className="col-lg-9 col-md-12 px-0">
            <div className="card rounded-0 h-100 border border-dark p-3">
              <div className="row g-3">
                <div className="col-12 col-md-3">
                  <label className="form-label fw-medium mb-1" htmlFor="vendor">
                    Vendor
                  </label>
                  <Select
                    options={vendorOptions}
                    value={formData.vendor}
                    onChange={(option) => handleSelectChange("vendor", option)}
                    placeholder="Select..."
                    classNamePrefix="react-select"
                    className={`custom-select ${
                      errors.vendor ? "is-invalid" : ""
                    }`}
                  />
                  <input
                    type="hidden"
                    name="vendor"
                    value={formData.vendor?.value || ""}
                  />
                  {errors.vendor && (
                    <div className="invalid-feedback">{errors.vendor}</div>
                  )}
                </div>
                <div className="col-12 col-md-3">
                  <label
                    className="form-label fw-medium mb-1"
                    htmlFor="invoiceNumber"
                  >
                    Invoice Number
                  </label>
                  <input
                    type="text"
                    name="invoiceNumber"
                    className={`form-control ${
                      errors.invoiceNumber ? "is-invalid" : ""
                    }`}
                    value={formData.invoiceNumber}
                    onChange={(e) =>
                      handleInputChange("invoiceNumber", e.target.value)
                    }
                  />
                  {errors.invoiceNumber && (
                    <div className="invalid-feedback">
                      {errors.invoiceNumber}
                    </div>
                  )}
                </div>
                <div className="col-12 col-md-3">
                  <label
                    className="form-label fw-medium mb-1"
                    htmlFor="invoiceDate"
                  >
                    Invoice Date
                  </label>
                  <DatePicker
                    selected={formData.invoiceDate}
                    onChange={(date) => handleInputChange("invoiceDate", date)}
                    className={`form-control ${
                      errors.invoiceDate ? "is-invalid" : ""
                    }`}
                    dateFormat="dd/MM/yyyy"
                  />
                  {errors.invoiceDate && (
                    <div className="invalid-feedback">{errors.invoiceDate}</div>
                  )}
                </div>
                <div className="col-12 col-md-3 d-flex align-items-center">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      name="isDelivered"
                      className="form-check-input rounded-0"
                      checked={formData.isDelivered}
                      onChange={(e) =>
                        handleInputChange("isDelivered", e.target.checked)
                      }
                    />
                    <label className="form-check-label">is Delivered</label>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <label className="form-label fw-medium mb-2">Product</label>
                <div className="input-group">
                  <Select
                    options={productOptions}
                    value={formData.product}
                    onChange={(option) => handleSelectChange("product", option)}
                    placeholder="Select..."
                    classNamePrefix="react-select"
                    className={`custom-select flex-grow-1 ${
                      errors.product ? "is-invalid" : ""
                    }`}
                  />
                </div>
                {errors.product && (
                  <div className="invalid-feedback d-block">
                    {errors.product}
                  </div>
                )}
              </div>
              <div className="table-responsive mt-3">
                <table className="table table-sm">
                  <thead className="uppercase text-slate-500 bg-slate-50 border-top border-bottom">
                    <tr>
                      <th className="px-2 py-3 custom-perchase-th">Image</th>
                      <th className="px-2 py-3 custom-perchase-th">Barcode</th>
                      <th className="px-2 py-3 custom-perchase-th">SKU</th>
                      <th className="px-2 py-3 custom-perchase-th">Quantity</th>
                      <th className="px-2 py-3 custom-perchase-th">MRP</th>
                      <th className="px-2 py-3 custom-perchase-th">PUR Rate</th>
                      <th className="px-2 py-3 custom-perchase-th">
                        DISC Type
                      </th>
                      <th className="px-2 py-3 custom-perchase-th">
                        DISC Rate
                      </th>
                      <th className="px-2 py-3 custom-perchase-th">
                        DISC Amount
                      </th>
                      <th className="px-2 py-3 custom-perchase-th">Tax</th>
                      <th className="px-2 py-3 custom-perchase-th">Tax AMT</th>
                      <th className="px-2 py-3 custom-perchase-th">
                        Total DISC
                      </th>
                      <th className="px-2 py-3 custom-perchase-th">
                        Total AMT
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-slate-200">
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan="13" className="text-center py-3">
                          No products added
                        </td>
                      </tr>
                    ) : (
                      products.map((product) => (
                        <tr key={product.id}>
                          <td className="px-2 py-3">-</td>
                          <td className="px-2 py-3">{product.barcode}</td>
                          <td className="px-2 py-3">{product.sku}</td>
                          <td className="px-2 py-3">{product.quantity}</td>
                          <td className="px-2 py-3">{product.mrp}</td>
                          <td className="px-2 py-3">{product.purRate}</td>
                          <td className="px-2 py-3">{product.discType}</td>
                          <td className="px-2 py-3">{product.discRate}</td>
                          <td className="px-2 py-3">{product.discAmount}</td>
                          <td className="px-2 py-3">{product.tax}</td>
                          <td className="px-2 py-3">{product.taxAmount}</td>
                          <td className="px-2 py-3">{product.totalDisc}</td>
                          <td className="px-2 py-3">{product.totalAmount}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          {/* Right Section - Summary */}
          <div className="col-lg-3 col-md-12 px-0">
            <div className="card h-100 rounded-0 border border-dark p-3">
              <h6 className="mb-3">Add Purchase</h6>
              <div className="mb-3">
                <div className="d-flex align-items-center gap-2 mb-1">
                  <label className="form-label fw-medium" htmlFor="store">
                    Store
                  </label>
                </div>
                <Select
                  options={storeOptions}
                  value={formData.store}
                  onChange={(option) => handleSelectChange("store", option)}
                  classNamePrefix="react-select"
                  className="custom-select"
                  isDisabled
                />
              </div>
              {[
                {
                  label: "Total Quantity",
                  name: "totalQuantity",
                  readOnly: true,
                },
                {
                  label: "Total Amount (inc tax and piece disc)",
                  name: "totalAmount",
                  readOnly: true,
                },
                { label: "Total Tax", name: "totalTax", readOnly: true },
                {
                  label: "Total Discount",
                  name: "totalDiscount",
                  readOnly: true,
                },
                { label: "Flat Discount", name: "flatDiscount" },
                { label: "Other Charges", name: "otherCharges" },
                { label: "Net Amount", name: "netAmount", readOnly: true },
              ].map((field) => (
                <div
                  className="mb-3 d-flex align-items-center gap-2"
                  key={field.name}
                >
                  <label className="form-label mb-0" htmlFor={field.name}>
                    {field.label}
                  </label>
                  <input
                    type="number"
                    name={field.name}
                    className={`form-control w-auto ${
                      field.readOnly ? "custom-disabled" : ""
                    }`}
                    value={formData[field.name]}
                    onChange={(e) =>
                      handleInputChange(field.name, e.target.value)
                    }
                    readOnly={field.readOnly}
                    min={0}
                  />
                </div>
              ))}
              <div className="mb-3">
                <label className="form-label fw-medium mb-1" htmlFor="notes">
                  Notes
                </label>
                <textarea
                  name="notes"
                  className="form-control"
                  rows="5"
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                />
              </div>
            </div>
          </div>
          <button type="submit" className="btn btn-primary w-auto text-white">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddPerchaseCom;
