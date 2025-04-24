import React, { useEffect, useState } from "react";
import Select from "react-select";
import { cashbookService } from "../../services/cashbookService";
import { toast } from "react-toastify";
import CommonButton from "../../components/CommonButton/CommonButton";

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
  const [storeData, setStoreData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  const [loading, setLoading] = useState(false);

  // Sample store options (replace with actual data from API)

  const storeOptions = storeData?.map((vendor) => ({
    value: vendor._id,
    label: `${vendor.name}`,
  }));

  const expenseCategoryOptions = categoryData?.map((vendor) => ({
    value: vendor._id,
    label: `${vendor.name}`,
  }));

  // Sample expense category options
  // const expenseCategoryOptions = [
  //   { value: "sales_return", label: "SALES RETURN" },
  //   { value: "rent", label: "RENT" },
  //   { value: "utilities", label: "UTILITIES" },
  // ];

  // Sample mode options
  const modeOptions = [
    { value: "card", label: "UPI" },
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
    if (!formData.mode) {
      newErrors.mode = "Mode is a required field";
    }

    if (!formData.type) {
      newErrors.type = "Type is a required field";
    }
    if (!formData.notes) {
      newErrors.notes = "Notes is a required field";
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    console.log("Form submitted:", formData);

    const body = {
      store: formData?.store?.value,
      expenseCategory: formData?.expenseCategory?.value,
      amount: formData?.amount,
      mode: formData?.mode?.value,
      notes: formData?.notes,
      type: formData?.type?.value,
    };

    setLoading(true);
    try {
      const response = await cashbookService.addExpense(body);
      if (response.success) {
        console.log("res", response);
        setFormData({
          store: null,
          expenseCategory: null,
          amount: "",
          mode: null,
          type: null,
          notes: "",
        });
        // setStoreData(response?.data?.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getStores();
    getCategoryData();
  }, []);

  const getStores = async () => {
    setLoading(true);
    try {
      const response = await cashbookService.getStores();
      if (response.success) {
        setStoreData(response?.data?.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryData = async () => {
    setLoading(true);
    try {
      const response = await cashbookService.getCategory();
      if (response.success) {
        console.log("res", response?.data?.data?.docs);
        setCategoryData(response?.data?.data?.docs);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid py-5 px-4 px-sm-5 px-lg-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-11">
          <div className="">
            <h1 className="h3 text-dark fw-bold">Add Expense</h1>
          </div>
          <div className=" shadow-sm">
            <div className="card-body p-4 p-sm-5">
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <p className="">Add Expense</p>
                </div>
                <div className="row g-4">
                  <div className="col-12 col-md-6 col-lg-4">
                    <label
                      htmlFor="store"
                      className="form-label font-weight-500 text-sm"
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
                      className="form-label font-weight-500 text-sm"
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
                      className="form-label font-weight-500 text-sm"
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
                      className="form-label font-weight-500 text-sm"
                    >
                      Mode <span className="text-danger">*</span>
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
                    {errors.mode && (
                      <div
                        id="amountError"
                        className="text-danger text-xs mt-1"
                      >
                        {errors.mode}
                      </div>
                    )}
                  </div>
                  <div className="col-12 col-md-6 col-lg-4">
                    <label
                      htmlFor="type"
                      className="form-label font-weight-500 text-sm"
                    >
                      Type <span className="text-danger">*</span>
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
                    {errors.type && (
                      <div
                        id="amountError"
                        className="text-danger text-xs mt-1"
                      >
                        {errors.type}
                      </div>
                    )}
                  </div>
                  <div className="col-12 col-md-6 col-lg-4">
                    <label
                      htmlFor="notes"
                      className="form-label font-weight-500 text-sm"
                    >
                      Notes <span className="text-danger">*</span>
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
                    {errors.notes && (
                      <div
                        id="amountError"
                        className="text-danger text-xs mt-1"
                      >
                        {errors.notes}
                      </div>
                    )}
                  </div>
                  <div className="col-12">
                    {/* <button type="submit" className="btn btn-primary">
                      Submit
                    </button> */}
                    <CommonButton
                      loading={loading}
                      buttonText="Submit"
                      onClick={handleSubmit}
                      className="btn btn-primary w-auto bg-indigo-500 hover-bg-indigo-600 text-white"
                    />
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
