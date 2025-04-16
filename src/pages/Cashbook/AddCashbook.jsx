import React, { useState } from "react";
import Select from "react-select";

const AddCashbook = () => {
  const [formData, setFormData] = useState({
    store: null,
    expenseCategory: null,
    amount: "",
    mode: null,
    type: null,
    notes: "",
  });
  const [errors, setErrors] = useState({});

  // Sample store options (replace with actual data from API)
  const storeOptions = [
    { value: "65aa1d545b58e0343976de38", label: "ELITE HOSPITAL / 27" },
    { value: "store2", label: "STORE 2 / 28" },
    { value: "store3", label: "STORE 3 / 29" },
  ];

  // Sample expense category options
  const expenseCategoryOptions = [
    { value: "sales_return", label: "SALES RETURN" },
    { value: "rent", label: "RENT" },
    { value: "utilities", label: "UTILITIES" },
  ];

  // Sample mode options
  const modeOptions = [
    { value: "upi", label: "UPI" },
    { value: "bank", label: "BANK" },
    { value: "cash", label: "CASH" },
  ];

  // Sample type options
  const typeOptions = [
    { value: "debit", label: "Debit(-)" },
    { value: "credit", label: "Credit(+)" },
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.store) {
      newErrors.store = "Store is a required field";
    }
    if (!formData.expenseCategory) {
      newErrors.expenseCategory = "Expense Category is a required field";
    }
    if (
      !formData.amount ||
      isNaN(formData.amount) ||
      Number(formData.amount) <= 0
    ) {
      newErrors.amount = "Amount must be a valid positive number";
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    console.log("Form submitted:", formData);
    // Add API call here (e.g., axios.post)
  };

  return (
    <div className="container-fluid py-5 px-4 px-sm-5 px-lg-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-11">
          <div className="">
            <h1 className="h3 text-dark fw-bold">Add Expense</h1>
          </div>
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4 p-sm-5">
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <p className="">Add Expense</p>
                </div>
                <div className="row g-4">
                  <div className="col-12 col-md-6 col-lg-4">
                    <label
                      htmlFor="store"
                      className="form-label fw-medium text-sm"
                    >
                      Stores <span className="text-danger">*</span>
                    </label>
                    <Select
                      id="store"
                      options={storeOptions}
                      value={formData.store}
                      onChange={(option) => handleInputChange("store", option)}
                      placeholder="Select..."
                      classNamePrefix="react-select"
                      aria-describedby="storeError"
                    />
                    <input
                      name="store"
                      type="hidden"
                      value={formData.store ? formData.store.value : ""}
                    />
                    {errors.store && (
                      <div id="storeError" className="text-danger text-xs mt-1">
                        {errors.store}
                      </div>
                    )}
                  </div>
                  <div className="col-12 col-md-6 col-lg-4">
                    <label
                      htmlFor="expenseCategory"
                      className="form-label fw-medium text-sm"
                    >
                      Expense Category <span className="text-danger">*</span>
                    </label>
                    <Select
                      id="expenseCategory"
                      options={expenseCategoryOptions}
                      value={formData.expenseCategory}
                      onChange={(option) =>
                        handleInputChange("expenseCategory", option)
                      }
                      placeholder="Select..."
                      classNamePrefix="react-select"
                      aria-describedby="expenseCategoryError"
                    />
                    <input
                      name="expenseCategory"
                      type="hidden"
                      value={
                        formData.expenseCategory
                          ? formData.expenseCategory.value
                          : ""
                      }
                    />
                    {errors.expenseCategory && (
                      <div
                        id="expenseCategoryError"
                        className="text-danger text-xs mt-1"
                      >
                        {errors.expenseCategory}
                      </div>
                    )}
                  </div>
                  <div className="col-12 col-md-6 col-lg-4">
                    <label
                      htmlFor="amount"
                      className="form-label fw-medium text-sm"
                    >
                      Amount <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      id="amount"
                      name="amount"
                      className="form-control"
                      step="0.001"
                      value={formData.amount}
                      onChange={(e) =>
                        handleInputChange("amount", e.target.value)
                      }
                      aria-describedby="amountError"
                    />
                    {errors.amount && (
                      <div
                        id="amountError"
                        className="text-danger text-xs mt-1"
                      >
                        {errors.amount}
                      </div>
                    )}
                  </div>
                  <div className="col-12 col-md-6 col-lg-4">
                    <label
                      htmlFor="mode"
                      className="form-label fw-medium text-sm"
                    >
                      Mode
                    </label>
                    <Select
                      id="mode"
                      options={modeOptions}
                      value={formData.mode}
                      onChange={(option) => handleInputChange("mode", option)}
                      placeholder="Select..."
                      classNamePrefix="react-select"
                    />
                    <input
                      name="mode"
                      type="hidden"
                      value={formData.mode ? formData.mode.value : ""}
                    />
                  </div>
                  <div className="col-12 col-md-6 col-lg-4">
                    <label
                      htmlFor="type"
                      className="form-label fw-medium text-sm"
                    >
                      Type
                    </label>
                    <Select
                      id="type"
                      options={typeOptions}
                      value={formData.type}
                      onChange={(option) => handleInputChange("type", option)}
                      placeholder="Select..."
                      classNamePrefix="react-select"
                    />
                    <input
                      name="type"
                      type="hidden"
                      value={formData.type ? formData.type.value : ""}
                    />
                  </div>
                  <div className="col-12 col-md-6 col-lg-4">
                    <label
                      htmlFor="notes"
                      className="form-label fw-medium text-sm"
                    >
                      Notes
                    </label>
                    <input
                      type="text"
                      id="notes"
                      name="notes"
                      className="form-control"
                      value={formData.notes}
                      onChange={(e) =>
                        handleInputChange("notes", e.target.value)
                      }
                    />
                  </div>
                  <div className="col-12">
                    <button type="submit" className="btn btn-primary">
                      Submit
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCashbook;
