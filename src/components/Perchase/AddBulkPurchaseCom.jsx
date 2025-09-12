import React, { useState, useEffect } from "react";
import Select from "react-select";
import "bootstrap/dist/css/bootstrap.min.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";
import { purchaseService } from "../../services/purchaseService";
import { inventoryService } from "../../services/inventoryService";

const AddBulkPurchaseCom = () => {
  // State for form fields
  const [formData, setFormData] = useState({
    vendor: null,
    invoiceNumber: "",
    invoiceDate: new Date(),
    isDelivered: true,
    store: null,
    file: null,
  });
  const [errors, setErrors] = useState({
    vendor: "",
    invoiceNumber: "",
    store: "",
    file: "",
  });
  const [vendorData, setVendorData] = useState([]);
  const [storeData, setStoreData] = useState([]);
  const [loading, setLoading] = useState(false);
  const users = JSON.parse(localStorage.getItem("user")) || {};

  // Vendor options
  const vendorOptions = vendorData?.docs?.map((vendor) => ({
    value: vendor._id,
    label: vendor.companyName,
  }));

  // Store options (filtered by user's stores)
  const storeOptions = storeData
    .filter((store) => users.stores.includes(store._id))
    .map((store) => ({
      value: store._id,
      label: `${store.name}${
        store.storeNumber ? ` / ${store.storeNumber}` : ""
      }`,
    }));

  // Fetch vendors and stores on component mount
  useEffect(() => {
    getVendors();
    getStores();
  }, []);

  // Fetch vendors
  const getVendors = async () => {
    setLoading(true);
    try {
      const response = await purchaseService.getVendors();
      if (response.success) {
        setVendorData(response?.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error fetching vendors:", error);
      toast.error("Failed to load vendors");
    } finally {
      setLoading(false);
    }
  };

  // Fetch stores and set default store if applicable
  const getStores = async () => {
    setLoading(true);
    try {
      const response = await inventoryService.getStores();
      if (response.success) {
        const stores = response?.data?.data || [];
        setStoreData(stores);
        // Set default store if user has access to only one store
        const userStores = stores.filter((store) =>
          users.stores.includes(store._id)
        );
        if (userStores.length === 1) {
          setFormData((prev) => ({
            ...prev,
            store: {
              value: userStores[0]._id,
              label: `${userStores[0].name}${
                userStores[0].storeNumber
                  ? ` / ${userStores[0].storeNumber}`
                  : ""
              }`,
            },
          }));
        }
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error fetching stores:", error);
      toast.error("Failed to load stores");
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle select changes
  const handleSelectChange = (name, option) => {
    setFormData((prev) => ({ ...prev, [name]: option }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setFormData((prev) => ({ ...prev, file }));
    if (errors.file) {
      setErrors((prev) => ({ ...prev, file: "" }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!formData.vendor) newErrors.vendor = "Vendor is required";
    if (!formData.invoiceNumber.trim())
      newErrors.invoiceNumber = "Invoice Number is required";
    if (!formData.store) newErrors.store = "Store is required";
    if (!formData.file) newErrors.file = "File is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    const payload = {
      vendorId: formData.vendor?.value,
      invoiceNumber: formData.invoiceNumber,
      date: formData.invoiceDate.toISOString().split("T")[0], // Format as YYYY-MM-DD
      store: formData.store?.value,
      isDelivered: formData.isDelivered,
      bulkUploadFile: formData.file,
    };

    setLoading(true);
    try {
      const response = await inventoryService.bulkInventoryUpload(payload);
      if (response.success) {
        toast.success(response.data.message);
        // Reset form, keeping store field unchanged
        setFormData((prev) => ({
          ...prev,
          vendor: null,
          invoiceNumber: "",
          invoiceDate: new Date(),
          isDelivered: true,
          file: null,
        }));
        setErrors({ vendor: "", invoiceNumber: "", store: "", file: "" });
        // Reset file input
        document.getElementById("file").value = null;
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error uploading inventory:", error);
      toast.error("Failed to upload inventory");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid px-md-5 px-2 py-5">
      <h1 className="h2 text-dark fw-bold mb-4 px-md-5 px-2">Bulk Purchase</h1>
      <div className="px-md-5">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label fw-medium mb-1" htmlFor="vendor">
                  Vendor
                </label>
                <Select
                  id="vendor"
                  value={formData.vendor}
                  onChange={(option) => handleSelectChange("vendor", option)}
                  options={vendorOptions}
                  placeholder="Select..."
                  className={`custom-select ${
                    errors.vendor ? "is-invalid" : ""
                  }`}
                  classNamePrefix="react-select"
                  isLoading={loading}
                />
                {errors.vendor && (
                  <div className="invalid-feedback">{errors.vendor}</div>
                )}
              </div>
              <div className="col-12 col-md-6">
                <label
                  className="form-label fw-medium mb-1"
                  htmlFor="invoiceNumber"
                >
                  Invoice Number
                </label>
                <input
                  type="text"
                  id="invoiceNumber"
                  className={`form-control ${
                    errors.invoiceNumber ? "is-invalid" : ""
                  }`}
                  value={formData.invoiceNumber}
                  onChange={(e) =>
                    handleInputChange("invoiceNumber", e.target.value)
                  }
                />
                {errors.invoiceNumber && (
                  <div className="invalid-feedback">{errors.invoiceNumber}</div>
                )}
              </div>
              <div className="col-12 col-md-6">
                <label
                  className="form-label fw-medium mb-1"
                  htmlFor="invoiceDate"
                >
                  Invoice Date
                </label>
                <DatePicker
                  id="invoiceDate"
                  selected={formData.invoiceDate}
                  onChange={(date) => handleInputChange("invoiceDate", date)}
                  className="form-control"
                  dateFormat="dd/MM/yyyy"
                />
              </div>
              <div className="col-12 col-md-6 d-flex align-items-end">
                <div className="form-check">
                  <input
                    type="checkbox"
                    id="isDelivered"
                    className="form-check-input"
                    checked={formData.isDelivered}
                    onChange={(e) =>
                      handleInputChange("isDelivered", e.target.checked)
                    }
                  />
                  <label className="form-check-label" htmlFor="isDelivered">
                    Is Delivered
                  </label>
                </div>
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label fw-medium mb-1" htmlFor="store">
                  Store
                </label>
                <Select
                  id="store"
                  value={formData.store}
                  onChange={(option) => handleSelectChange("store", option)}
                  options={storeOptions}
                  placeholder="Select..."
                  className={`custom-select ${
                    errors.store ? "is-invalid" : ""
                  }`}
                  classNamePrefix="react-select"
                  isLoading={loading}
                  isDisabled={storeOptions.length <= 1}
                />
                {errors.store && (
                  <div className="invalid-feedback">{errors.store}</div>
                )}
              </div>
              <div className="col-12">
                <label className="form-label fw-medium mb-1" htmlFor="file">
                  Upload Inventory File
                </label>
                <input
                  type="file"
                  id="file"
                  className={`form-control ${errors.file ? "is-invalid" : ""}`}
                  accept=".xls,.xlsx,.csv"
                  onChange={handleFileChange}
                />
                {errors.file && (
                  <div className="invalid-feedback">{errors.file}</div>
                )}
              </div>
              <div className="col-12">
                <button
                  type="submit"
                  className="btn mt-2 px-4 py-2 custom-button-bgcolor"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Loading...
                    </>
                  ) : (
                    "Submit"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddBulkPurchaseCom;
