import React, { useState } from "react";
import "../../assets/css/Sale/sale_style.css";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import { useNavigate } from "react-router-dom";

const SaleForm = () => {
  const [formData, setFormData] = useState({
    customerId: "",
    customerName: "",
    customerPhone: "",
    salesRep: "",
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
    if (!formData.customerName) {
      newErrors.customerName = "Customer Name is required";
    }
    if (!formData.customerPhone) {
      newErrors.customerPhone = "Customer Phone is required";
    }
    if (!formData.salesRep) {
      newErrors.salesRep = "Sales Rep is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleReceivedAmountChange = (index, field, value) => {
    const updatedAmounts = [...receivedAmounts];
    updatedAmounts[index][field] = value;
    setReceivedAmounts(updatedAmounts);
  };

  const addReceivedAmount = () => {
    setReceivedAmounts([
      ...receivedAmounts,
      {
        method: "cash",
        amount: 0,
        date: "14/04/2025",
        reference: "",
      },
    ]);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("Form submitted:", formData);
    }
  };
  const removeReceivedAmount = (index) => {
    const updatedAmounts = receivedAmounts.filter((_, i) => i !== index);
    setReceivedAmounts(updatedAmounts);
  };
  const handleAddCustomerClick = () => {
    navigate("/addCustomer");
  };
  return (
    <form className="container-fluid p-5" onSubmit={handleSubmit}>
      <div className="row d-flex align-items-stretch">
        {/* Left Column */}
        <div className="col-lg-9 col-md-6 col-12 p-0">
          <div className="border h-100 border-black  p-4 bg-white d-flex flex-column gap-4">
            {/* Customer Section */}
            <div>
              <label htmlFor="customerId" className="custom-label">
                Customer
                <button
                  type="button"
                  className="btn ms-2 px-3 py-1"
                  style={{
                    borderColor: "#e2e8f0",
                    color: "#4f46e5",
                    fontSize: "0.875rem",
                  }}
                  onMouseOver={(e) => (e.target.style.borderColor = "#cbd5e1")}
                  onMouseOut={(e) => (e.target.style.borderColor = "#e2e8f0")}
                  onClick={handleAddCustomerClick}
                >
                  Add Customer
                </button>
              </label>
              <select
                className="form-select custom-select"
                id="customerId"
                name="customerId"
                value={formData.customerId}
                onChange={handleInputChange}
                style={{ height: "38px", color: "#808080 " }}
              >
                <option value="">Select...</option>
                <option value="1">Customer 1</option>
                <option value="2">Customer 2</option>
              </select>
            </div>

            <div className="row g-4">
              <div className="col-md-4 col-12">
                <label htmlFor="customerName" className="custom-label">
                  Customer Name
                </label>

                <input
                  type="text"
                  className={`form-control custom-disabled w-100 ${
                    errors.customerName ? "is-invalid" : ""
                  }`}
                  id="customerName"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                />
                {errors.customerName && (
                  <div className="invalid-feedback">{errors.customerName}</div>
                )}
              </div>
              <div className="col-md-4 col-12">
                <label htmlFor="customerPhone" className="custom-label">
                  Customer Phone
                </label>

                <input
                  type="text"
                  className={`form-control custom-disabled w-100 ${
                    errors.customerPhone ? "is-invalid" : ""
                  }`}
                  id="customerPhone"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleInputChange}
                />
                {errors.customerPhone && (
                  <div className="invalid-feedback">{errors.customerPhone}</div>
                )}
              </div>
              <div className="col-md-4 col-12">
                <label htmlFor="salesRep" className="custom-label">
                  Sales Rep
                </label>
                <select
                  className={`form-select w-100 ${
                    errors.salesRep ? "is-invalid" : ""
                  }`}
                  id="salesRep"
                  name="salesRep"
                  value={formData.salesRep}
                  onChange={handleInputChange}
                  style={{ color: "#808080" }}
                >
                  <option value="">Select...</option>
                  <option value="rep1">Rep 1</option>
                  <option value="rep2">Rep 2</option>
                </select>
                {errors.salesRep && (
                  <div className="invalid-feedback">{errors.salesRep}</div>
                )}
              </div>
            </div>

            <div className="d-flex gap-4 w-100">
              <div className="w-100">
                <label htmlFor="product" className="custom-label">
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
              className="table-responsive"
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
                      SKU
                    </th>
                    <th
                      style={{ minWidth: "80px", padding: "0.75rem 0.5rem" }}
                      className="custom-th"
                    >
                      Photos
                    </th>
                    <th
                      style={{ minWidth: "20px", padding: "0.75rem 0.5rem" }}
                      className="custom-th"
                    >
                      Stock
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
                      SRP
                    </th>
                    <th
                      style={{ minWidth: "80px", padding: "0.75rem 0.5rem" }}
                      className="custom-th"
                    >
                      Tax Rate
                    </th>
                    <th
                      style={{ minWidth: "20px", padding: "0.75rem 0.5rem" }}
                      className="custom-th"
                    >
                      Tax Amount
                    </th>
                    <th
                      style={{ minWidth: "20px", padding: "0.75rem 0.5rem" }}
                      className="custom-th"
                    >
                      Discount
                    </th>
                    <th
                      style={{
                        minWidth: "50px",
                        padding: "0.75rem 0.5rem 0.75rem 1.25rem",
                      }}
                      className="custom-th"
                    >
                      Total Amount
                    </th>
                  </tr>
                </thead>
                <tbody
                  style={{
                    fontSize: "0.875rem",
                  }}
                >
                  <td colSpan="10" className="text-center">
                    No products added
                  </td>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column - Summary */}
        <div className="col-lg-3 col-md-6 col-12 p-0">
          <div className="border border-black  p-4 bg-white">
            <div className="mb-3 w-100">
              <div className="d-flex align-items-center gap-2 mb-1">
                <label className="custom-label" htmlFor="store">
                  Store
                </label>
              </div>
              <select
                className="form-select w-100 custom-disabled custom-select"
                id="salesRep"
                name="salesRep"
                value={formData.salesRep}
                onChange={handleInputChange}
                style={{ color: "#808080" }}
                disabled
              >
                <option value="">Select...</option>
                <option value="rep1">Rep 1</option>
                <option value="rep2">Rep 2</option>
              </select>
            </div>

            {[
              {
                label: "Total Quantity",
                name: "totalQuantity",
                readOnly: true,
              },
              { label: "Total Amount", name: "totalAmount", readOnly: true },
              { label: "Total Tax", name: "totalTax", readOnly: true },
              { label: "Flat Discount", name: "flatDiscount" },
              { label: "Coupon Discount", name: "couponDiscount" },
              { label: "Other Charges", name: "otherCharges" },
              { label: "Total Discount", name: "netDiscount", readOnly: true },
            ].map((field) => (
              <div
                className="d-flex gap-2 align-items-center mb-2"
                key={field.name}
              >
                <label className="custom-label " htmlFor={field.name}>
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

            {/* Coupon Section */}
            <div className="border border-black rounded p-2 ">
              <label className="custom-label  d-block">Coupon</label>
              <div className="">
                <input
                  type="text"
                  className="form-control w-100 "
                  id="coupon"
                  name="coupon"
                  placeholder="Enter Coupon Code"
                  value={formData.coupon}
                  onChange={handleInputChange}
                />
                <button
                  className="btn btn-primary w-auto mt-2"
                  style={{ backgroundColor: "#4f46e5", borderColor: "#4f46e5" }}
                  type="button"
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = "#4338ca";
                    e.target.style.borderColor = "#4338ca";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = "#4f46e5";
                    e.target.style.borderColor = "#4f46e5";
                  }}
                >
                  Add
                </button>
              </div>
            </div>

            <div className="d-flex gap-2 align-items-center mt-3">
              <label className="custom-label" htmlFor="netAmount">
                Net Amount
              </label>
              <div className="flex-grow-1">
                <input
                  type="number"
                  className="form-control custom-disabled w-100"
                  id="netAmount"
                  name="netAmount"
                  value={formData.netAmount}
                  readOnly
                  min="0"
                />
              </div>
            </div>

            <div>
              <label htmlFor="note" className="custom-label">
                Notes
              </label>
              <textarea
                className="form-control w-100"
                id="note"
                name="note"
                rows="4"
                value={formData.note}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        {/* Final Section */}
        <div className="col-12 p-0">
          <div className="border border-black p-3  bg-white">
            <div className="d-flex justify-content-end ">
              <span>Due Amount: {formData.dueAmount}</span>
            </div>

            <div className="d-flex align-items-center gap-3 ">
              <label className="custom-label">Received Amount</label>
              <button
                type="button"
                className="btn px-3 py-1"
                style={{
                  borderColor: "#e2e8f0",
                  color: "#4f46e5",
                  fontSize: "0.875rem",
                }}
                onMouseOver={(e) => (e.target.style.borderColor = "#cbd5e1")}
                onMouseOut={(e) => (e.target.style.borderColor = "#e2e8f0")}
                onClick={addReceivedAmount}
              >
                Add
              </button>
            </div>

            <div className="mt-3">
              {receivedAmounts.length === 0 ? (
                // <div className="text-center py-2">No received amounts</div>
                <></>
              ) : (
                receivedAmounts.map((amount, index) => (
                  <div className="row align-items-center px-3 mb-3" key={index}>
                    {/* Remove Button + Select */}
                    <div className="col-md-3 p-1 d-flex align-items-center">
                      <button
                        type="button"
                        onClick={() => removeReceivedAmount(index)}
                        className="btn p-0 me-2"
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                      <select
                        className="form-select"
                        name={`receivedAmount.${index}.method`}
                        value={amount.method}
                        onChange={(e) =>
                          handleReceivedAmountChange(
                            index,
                            "method",
                            e.target.value
                          )
                        }
                      >
                        <option value="cash">Cash</option>
                        <option value="card">Card</option>
                        <option value="bank">Bank</option>
                      </select>
                    </div>

                    {/* Amount */}
                    <div className="col-md-3 p-1">
                      <input
                        type="number"
                        className="form-control"
                        name={`receivedAmount.${index}.amount`}
                        value={amount.amount}
                        onChange={(e) =>
                          handleReceivedAmountChange(
                            index,
                            "amount",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="col-md-3 p-1">
                      <DatePicker
                        selected={
                          amount.date && !isNaN(new Date(amount.date))
                            ? new Date(amount.date)
                            : null
                        }
                        onChange={(date) =>
                          handleReceivedAmountChange(
                            index,
                            "date",
                            date ? date.toISOString().split("T")[0] : ""
                          )
                        }
                        className="form-control"
                        placeholderText="Select date"
                        dateFormat="yyyy-MM-dd"
                      />
                    </div>

                    {/* Reference */}
                    <div className="col-md-3">
                      <input
                        type="text"
                        className="form-control"
                        name={`receivedAmount.${index}.reference`}
                        value={amount.reference}
                        onChange={(e) =>
                          handleReceivedAmountChange(
                            index,
                            "reference",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
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

export default SaleForm;
