import React, { useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import { useNavigate } from "react-router-dom";

const StockSaleForm = () => {
  const [formData, setFormData] = useState({
    from: "",
    to: "",
    product: "",
    store: "ELITE HOSPITAL / 27",
    totalQuantity: 0,
    totalAmount: 0,
    totalTax: 0,
    flatDiscount: 0,
    couponDiscount: 0,
    otherCharges: 0,
    netDiscount: 0,
    coupon: "",
    netAmount: 0,
    note: "",
    dueAmount: 0,
  });

  const [receivedAmounts, setReceivedAmounts] = useState([]);
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.from) {
      newErrors.from = "From Rep is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("Form submitted:", formData);
    }
  };

  return (
    <form className="container-fluid px-5" onSubmit={handleSubmit}>
      <div className="row d-flex align-items-stretch">
        {/* Left Column */}
        <div className="col-lg-9 col-md-6 col-12 p-0">
          <div className="border  border-black  p-4 bg-white d-flex flex-column gap-4">
            <div className="row g-4">
              <div className="col-md-4 col-12">
                <label htmlFor="from" className="custom-label font-weight-500">
                  From
                </label>
                <select
                  className={`form-select w-100 ${
                    errors.from ? "is-invalid" : ""
                  }`}
                  id="from"
                  name="from"
                  value={formData.from}
                  onChange={handleInputChange}
                  style={{ color: "#808080" }}
                  disabled
                >
                  <option value="">Select...</option>
                  <option value="rep1">Rep 1</option>
                  <option value="rep2">Rep 2</option>
                </select>
                {errors.from && (
                  <div className="invalid-feedback">{errors.from}</div>
                )}
              </div>
              <div className="col-md-4 col-12">
                <label htmlFor="to" className="custom-label font-weight-500">
                  To
                </label>
                <select
                  className={`form-select w-100 ${
                    errors.to ? "is-invalid" : ""
                  }`}
                  id="to"
                  name="to"
                  value={formData.to}
                  onChange={handleInputChange}
                  style={{ color: "#808080" }}
                >
                  <option value="">Select...</option>
                  <option value="rep1">To 1</option>
                  <option value="rep2">To 2</option>
                </select>
                {errors.to && (
                  <div className="invalid-feedback">{errors.to}</div>
                )}
              </div>
            </div>

            <div className="d-flex gap-4 w-100">
              <div className="w-100">
                <label
                  htmlFor="product"
                  className="custom-label font-weight-500"
                >
                  Product
                </label>
                <select
                  className="form-select w-100"
                  id="product"
                  name="product"
                  value={formData.product}
                  onChange={handleInputChange}
                  style={{ color: "#808080" }}
                >
                  <option value="">Select...</option>
                  <option value="prod1">Product 1</option>
                  <option value="prod2">Product 2</option>
                </select>
              </div>
            </div>

            {/* Product Table */}
            <div
              className="table-responsive px-2"
              style={{ maxHeight: "400px", overflowY: "auto" }}
            >
              <table className="table table-sm align-middle custom-table">
                <thead
                  className="text-uppercase"
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "#64748b",
                    backgroundColor: "#f8fafc",
                    borderTop: "1px solid #e5e7eb",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  <tr>
                    <th
                      style={{
                        minWidth: "80px",
                        padding: "0.75rem 1.25rem 0.75rem 1.25rem",
                      }}
                      className="custom-th"
                    >
                      Barcode
                    </th>
                    <th
                      style={{
                        minWidth: "160px",
                        padding: "0.75rem 0.5rem",
                        color: "",
                      }}
                      className="custom-th"
                    >
                      stock
                    </th>
                    <th
                      style={{ minWidth: "80px", padding: "0.75rem 0.5rem" }}
                      className="custom-th"
                    >
                      qty
                    </th>
                    <th
                      style={{ minWidth: "20px", padding: "0.75rem 0.5rem" }}
                      className="custom-th"
                    >
                      sku
                    </th>
                    <th
                      style={{ minWidth: "80px", padding: "0.75rem 0.5rem" }}
                      className="custom-th"
                    >
                      MRP
                    </th>
                    <th
                      style={{ minWidth: "80px", padding: "0.75rem 0.5rem" }}
                      className="custom-th"
                    >
                      resellerPrice
                    </th>
                    <th
                      style={{ minWidth: "80px", padding: "0.75rem 0.5rem" }}
                      className="custom-th"
                    >
                      taxAmount
                    </th>
                    <th
                      style={{ minWidth: "20px", padding: "0.75rem 0.5rem" }}
                      className="custom-th"
                    >
                      Amount
                    </th>
                  </tr>
                </thead>
                {/* <tbody
                  style={{
                    fontSize: "0.875rem",
                  }}
                >
                  <td colSpan="10" className="text-center">
                    No products added
                  </td>
                </tbody> */}
              </table>
            </div>
          </div>
        </div>

        {/* Right Column - Summary */}
        <div className="col-lg-3 col-md-6 col-12 p-0">
          <div className="border h-100 border-black  p-4 bg-white">
            {[
              {
                label: "Total Quantity",
                name: "totalQuantity",
                readOnly: true,
              },
              { label: "Total Amount", name: "totalAmount", readOnly: true },
              { label: "Flat Discount", name: "flatDiscount" },
              { label: "Other Charges", name: "otherCharges" },
              { label: "Net Amount", name: "netAmount", readOnly: true },
            ].map((field) => (
              <div
                className="d-flex gap-2 align-items-center mb-2"
                key={field.name}
              >
                <label
                  className="custom-label font-weight-500"
                  htmlFor={field.name}
                >
                  {field.label}
                </label>
                <div className="flex-grow-1">
                  <input
                    type="number"
                    className={`form-control w-auto ${
                      field.readOnly ? "custom-disabled" : ""
                    }`}
                    id={field.name}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleInputChange}
                    readOnly={field.readOnly}
                    min={
                      field.name === "netAmount" || field.name === "totalTax"
                        ? 0
                        : undefined
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-12 mt-3">
          <button type="submit" className="btn btn-primary">
            Submit
          </button>
        </div>
      </div>
    </form>
  );
};

export default StockSaleForm;
