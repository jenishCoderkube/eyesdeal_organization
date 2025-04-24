import React, { useState } from "react";
import Select from "react-select";
import HeaderTitle from "../../components/CommonTitle/HeaderTitle";

const SaleReturn = () => {
  const [formData, setFormData] = useState({
    customer: null,
    customerName: "",
    customerPhone: "",
    salesRep: { value: "6790feca3601ef3b055d2450", label: "HIRAL JAIN" },
    store: { value: "elite-hospital-27", label: "ELITE HOSPITAL / 27" },
  });

  const [errors, setErrors] = useState({
    customerName: "",
    customerPhone: "",
    salesRep: "",
  });

  const customerOptions = [
    { value: "customer1", label: "Customer 1" },
    { value: "customer2", label: "Customer 2" },
  ];

  const salesRepOptions = [
    { value: "6790feca3601ef3b055d2450", label: "HIRAL JAIN" },
    { value: "salesrep2", label: "Sales Rep 2" },
  ];

  const storeOptions = [
    { value: "elite-hospital-27", label: "ELITE HOSPITAL / 27" },
    { value: "store2", label: "Store 2" },
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for the field when user starts typing/selecting
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      customerName: "",
      customerPhone: "",
      salesRep: "",
    };

    if (!formData.customerName.trim()) {
      newErrors.customerName = "Customer Name is required";
      isValid = false;
    }

    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = "Customer Phone is required";
      isValid = false;
    } else if (!/^\d{10}$/.test(formData.customerPhone.trim())) {
      // Basic phone number validation (10 digits)
      newErrors.customerPhone = "Please enter a valid 10-digit phone number";
      isValid = false;
    }

    if (!formData.salesRep) {
      newErrors.salesRep = "Sales Rep is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log(formData);
    }
  };

  return (
    <div className="container-fluid p-4">
      <div>
        <HeaderTitle title="Return Sale" />
      </div>
      <form onSubmit={handleSubmit}>
        <div className="card shadow-none border border-dark p-3 mb-4">
          <div className="row g-3">
            <div className="col-12">
              <label
                htmlFor="customerId"
                className="form-label font-weight-600 mb-1"
              >
                Customer
              </label>
              <Select
                options={customerOptions}
                value={formData.customer}
                onChange={(option) => handleInputChange("customer", option)}
                placeholder="Select..."
                classNamePrefix="react-select"
                className="custom-select"
              />
              <input
                type="hidden"
                name="customerId"
                value={formData.customer?.value || ""}
              />
            </div>
            <div className="col-12">
              <div className="row g-3">
                <div className="col-12 col-md-6 col-lg-3">
                  <label
                    htmlFor="customerName"
                    className="form-label  font-weight-600 mb-1"
                  >
                    Customer Name
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    disabled
                    className={`form-control custom-disabled ${
                      errors.customerName ? "is-invalid" : ""
                    }`}
                    value={formData.customerName}
                    onChange={(e) =>
                      handleInputChange("customerName", e.target.value)
                    }
                    // Removed readOnly to allow user input
                  />
                  {errors.customerName && (
                    <div className="invalid-feedback">
                      {errors.customerName}
                    </div>
                  )}
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                  <label
                    htmlFor="customerPhone"
                    className="form-label font-weight-600 mb-1"
                  >
                    Customer Phone
                  </label>
                  <input
                    type="text"
                    name="customerPhone"
                    disabled
                    className={`form-control custom-disabled ${
                      errors.customerPhone ? "is-invalid" : ""
                    }`}
                    value={formData.customerPhone}
                    onChange={(e) =>
                      handleInputChange("customerPhone", e.target.value)
                    }
                    // Removed readOnly to allow user input
                  />
                  {errors.customerPhone && (
                    <div className="invalid-feedback">
                      {errors.customerPhone}
                    </div>
                  )}
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                  <label
                    htmlFor="salesRep"
                    className="form-label font-weight-600 mb-1"
                  >
                    Sales Rep
                  </label>
                  <Select
                    options={salesRepOptions}
                    value={formData.salesRep}
                    onChange={(option) => handleInputChange("salesRep", option)}
                    placeholder="Select..."
                    classNamePrefix="react-select"
                    className={`custom-select ${
                      errors.salesRep ? "is-invalid" : ""
                    }`}
                  />
                  <input
                    type="hidden"
                    name="salesRep"
                    value={formData.salesRep?.value || ""}
                  />
                  {errors.salesRep && (
                    <div style={{ color: "red", fontSize: "0.875rem" }}>
                      {errors.salesRep}
                    </div>
                  )}
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                  <label
                    htmlFor="store"
                    className="form-label font-weight-600 mb-1"
                  >
                    Store
                  </label>
                  <Select
                    options={storeOptions}
                    value={formData.store}
                    onChange={(option) => handleInputChange("store", option)}
                    placeholder="Select..."
                    classNamePrefix="react-select"
                    className="custom-select"
                    isDisabled
                  />
                  <input
                    type="hidden"
                    name="store"
                    value={formData.store?.value || ""}
                  />
                </div>
              </div>
            </div>
            <div className="col-12 mt-4">
              <label className="form-label mb-2">Products</label>
              <div className="table-responsive">
                <table className="table table-auto w-full border-top border-slate-200">
                  <thead className="font-semibold uppercase text-slate-500 bg-slate-50 border-top border-bottom">
                    <tr>
                      <th
                        scope="col"
                        className="px-3 first:pl-5 last:pr-5 text-start"
                      >
                        <div className="custom-th  product_head_title">
                          BARCODE
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-2 first:pl-5 last:pr-5 py-3 text-start"
                      >
                        <div className=" custom-th product_head_title">SRP</div>
                      </th>
                      <th
                        scope="col"
                        className="px-2 first:pl-5 last:pr-5 py-3 text-start"
                      >
                        <div className=" custom-th product_head_title">SKU</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-slate-200">
                    {/* Add product rows dynamically if needed */}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="col-12">
              <div className="px-4 bg-light rounded">
                <div className="mb-3">
                  <label className="form-label">Pay Amount</label>
                </div>
                <div className="table-responsive">
                  <table className="table table-bordered table-sm">
                    <tbody className="text-sm">
                      {/* Add payment rows dynamically if needed */}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <button type="submit" className="btn btn-primary text-white">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default SaleReturn;
