import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AsyncSelect from "react-select/async";
import DatePicker from "react-datepicker";
import "../../assets/css/Sale/sale_style.css";
import "react-datepicker/dist/react-datepicker.css";
import { saleService } from "../../services/saleService";
import PrescriptionModel from "../../components/Process/PrescriptionModel";
import OrdersModel from "../../components/Process/OrdersModel";
import { storeService } from "../../services/storeService";
import InventoryData from "../../components/Sale/InventoryData";
import ProductSelector from "../../components/Sale/ProductSelector";
import { toast } from "react-toastify";

const SaleForm = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

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
    prescriptions: [],
    recallOption: "",
    recallDate: "",
  });

  const [receivedAmounts, setReceivedAmounts] = useState([]);
  const [errors, setErrors] = useState({});
  const [salesData, setSalesData] = useState([]);
  const [salesRepData, setSalesRepData] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [defaultStore, setDefaultStore] = useState(null);
  const [showProductSelector, setShowProductSelector] = useState(true);
  const [PrescriptionModelVisible, setPrescriptionModelVisible] =
    useState(false);
  const [selectedCust, setSelectedCust] = useState(null);
  const [OrderModelVisible, setOrderModelVisible] = useState(false);
  const [SalesOrderData, setSalesOrderData] = useState(null);
  const [inventoryData, setInventoryData] = useState([]);
  const [InventoryPairs, setInventoryPairs] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [documentsFiles, setDocumentsFiles] = useState([]);
  const recallOptions = [
    { value: "3 month", label: "3 month" },
    { value: "6 month", label: "6 month" },
    { value: "9 month", label: "9 month" },
    { value: "12 month", label: "12 month" },
    { value: "other", label: "Other" },
  ];

  const loadRecallOptions = (inputValue, callback) => {
    const filtered = recallOptions.filter((option) =>
      option.label.toLowerCase().includes(inputValue.toLowerCase())
    );
    callback(filtered);
  };

  useEffect(() => {
    const fetchStoresData = async () => {
      try {
        const allStores = await storeService.getStores();
        const userStoreIds = user?.stores || [];

        const matchedStores = allStores
          .filter((store) => userStoreIds.includes(store._id))
          .map((store) => ({
            value: store._id,
            label: `${store.storeNumber} / ${store.name}`,
            data: store,
          }));
        console.log("matchedStoresmatchedStores<<", matchedStores);

        setFilteredStores(matchedStores);
        if (matchedStores.length === 1) {
          const defaultStore = matchedStores[0];
          setDefaultStore(defaultStore);
          setFormData((prev) => ({ ...prev, store: defaultStore.label }));
        }
      } catch (error) {
        console.error("Error fetching stores:", error);
      }
    };

    fetchStoresData();
  }, []);

  const loadStoreOptions = (inputValue, callback) => {
    const filtered = filteredStores.filter((option) =>
      option.label.toLowerCase().includes(inputValue.toLowerCase())
    );
    callback(filtered);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.customerName)
      newErrors.customerName = "Customer Name is required";
    if (!formData.customerPhone)
      newErrors.customerPhone = "Customer Phone is required";
    if (!formData.salesRep) newErrors.salesRep = "Sales Rep is required";
    if (!formData.recallOption)
      newErrors.recallOption = "Recall Date is required";
    if (formData.recallOption === "other" && !formData.recallDate)
      newErrors.recallDate = "Custom Recall Date is required";

    receivedAmounts.forEach((amount, index) => {
      if (!amount.date) {
        newErrors[`receivedAmount.${index}.date`] = "Date is required";
      }
      if (!amount.amount || amount.amount <= 0) {
        newErrors[`receivedAmount.${index}.amount`] =
          "Valid amount is required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleReceivedAmountChange = (index, field, value) => {
    const updatedAmounts = [...receivedAmounts];
    updatedAmounts[index][field] = value;
    setReceivedAmounts(updatedAmounts);
    if (errors[`receivedAmount.${index}.${field}`]) {
      setErrors({ ...errors, [`receivedAmount.${index}.${field}`]: "" });
    }
  };

  const addReceivedAmount = () => {
    const today = new Date().toISOString().split("T")[0];
    setReceivedAmounts([
      ...receivedAmounts,
      { method: "cash", amount: 0, date: today, reference: "" },
    ]);
  };

  const removeReceivedAmount = (index) => {
    const updatedAmounts = receivedAmounts.filter((_, i) => i !== index);
    setReceivedAmounts(updatedAmounts);
    const newErrors = { ...errors };
    Object.keys(newErrors).forEach((key) => {
      if (key.startsWith(`receivedAmount.${index}.`)) {
        delete newErrors[key];
      }
    });
    setErrors(newErrors);
  };

  const handleAddCustomerClick = () => {
    navigate("/users/addCustomer");
  };

  const loadCustomerOptions = async (inputValue) => {
    try {
      const response = await saleService.listUsers(inputValue);
      if (response.success) {
        return response.data.data.docs.map((cust) => ({
          value: cust._id,
          label: `${cust.name} / ${cust.phone}`,
          data: cust,
        }));
      } else {
        console.error(response.data.message);
        return [];
      }
    } catch (error) {
      console.error("Error fetching customers:", error);

      return [];
    }
  };

  const loadCustomerSalesData = async (custID) => {
    try {
      const response = await saleService.sales(custID);
      if (response.success) {
        setSalesData(response.data.data);
      } else {
        console.error(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching customer sales:", error);
    }
  };

  const fetchSalesRepData = async (storeId) => {
    try {
      const response = await saleService.getSalesRep(storeId);
      if (response.success) {
        setSalesRepData(response.data.data.docs);
      } else {
        console.error(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching sales reps:", error);
    }
  };

  const transformInventoryPairs = (inventoryPairs) => {
    return inventoryPairs.map((pair) => ({
      product: pair.product
        ? {
            product: pair.product._id || pair.product.product,
            productObject: pair.product.productObject || pair.product,
            quantity: pair.product.quantity || 1,
            barcode:
              pair.product.barcode ||
              pair.product.newBarcode ||
              pair.product.oldBarcode,
            stock:
              pair.product.stock || pair.product.inventory?.totalQuantity || 0,
            sku: pair.product.sku,
            photos: pair.product.photos || [],
            mrp: pair.product.mrp || pair.product.MRP || 0,
            srp: pair.product.srp || pair.product.sellPrice || 0,
            taxRate: pair.product.taxRate || `${pair.product.tax} (Inc)`,
            taxAmount: pair.product.taxAmount || 0,
            discount: pair.product.discount || 0,
            displayName: pair.product.displayName,
            unit: pair.product.unit?.name || pair.product.unit,
            netAmount: pair.product.netAmount || pair.product.sellPrice || 0,
            inclusiveTax: null,
            manageStock: pair.product.manageStock,
            resellerPrice: pair.product.resellerPrice || 0,
            incentiveAmount: pair.product.incentiveAmount || 0,
          }
        : null,
      rightLens: pair.rightLens
        ? {
            product: pair.rightLens.item,
            quantity: pair.rightLens.quantity || 1,
            barcode: pair.rightLens.barcode,
            stock: pair.rightLens.stock || 0,
            sku: pair.rightLens.sku,
            photos: pair.rightLens.photos || [],
            mrp: pair.rightLens.mrp,
            srp: pair.rightLens.srp,
            taxRate: pair.rightLens.taxRate,
            taxAmount: pair.rightLens.perPieceTax,
            discount: pair.rightLens.perPieceDiscount,
            netAmount: pair.rightLens.perPieceAmount,
            inclusiveTax: pair.rightLens.inclusiveTax,
            manageStock: pair.rightLens.manageStock,
            displayName: pair.rightLens.displayName,
            unit: pair.rightLens.unit,
            incentiveAmount: pair.rightLens.incentiveAmount,
          }
        : null,
      leftLens: pair.leftLens
        ? {
            product: pair.leftLens.item,
            quantity: pair.leftLens.quantity || 1,
            barcode: pair.leftLens.barcode,
            stock: pair.leftLens.stock || 0,
            sku: pair.leftLens.sku,
            photos: pair.leftLens.photos || [],
            mrp: pair.leftLens.mrp,
            srp: pair.leftLens.srp,
            taxRate: pair.leftLens.taxRate,
            taxAmount: pair.leftLens.perPieceTax,
            discount: pair.leftLens.perPieceDiscount,
            netAmount: pair.leftLens.perPieceAmount,
            inclusiveTax: pair.leftLens.inclusiveTax,
            manageStock: pair.leftLens.manageStock,
            displayName: pair.leftLens.displayName,
            unit: pair.leftLens.unit,
            incentiveAmount: pair.leftLens.incentiveAmount,
          }
        : null,
    }));
  };

  const checkingCouponCode = async (coupon, customerPhone, inventoryPairs) => {
    try {
      const products = transformInventoryPairs(inventoryPairs);
      const response = await saleService.checkCouponCode({
        couponCode: coupon,
        phone: customerPhone,
        products,
      });
      if (response.success) {
        console.log(response.data);
        toast.success("Coupon applied successfully");
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error checking coupon:", error);
    }
  };

  const addDocumentInput = () => {
    setDocuments([...documents, { documentName: "", documentFile: null }]);
  };

  const removeDocumentInput = (index) => {
    const updatedDocuments = documents.filter((_, i) => i !== index);
    setDocuments(updatedDocuments);
  };

  const handleDocumentChange = (index, field, value) => {
    const updatedDocuments = [...documents];
    updatedDocuments[index][field] = value;
    setDocuments(updatedDocuments);
  };

  const uploadDocument = async (file, fileName, index) => {
    if (!file || !fileName) {
      toast.error("Please provide both document name and file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", fileName);
    formData.append("location", "Sale/documents/");

    try {
      const response = await saleService.uploadFile(formData);
      if (response.success) {
        toast.success("Document uploaded successfully!");
        const newKeys = response.data.data.map((item) => item.key);
        setDocumentsFiles((prevDocuments) => [...prevDocuments, ...newKeys]);
      } else {
        toast.error(response.message || "Failed to upload document.");
      }
    } catch (error) {
      console.error("Error uploading document:", error);
    }
  };

  useEffect(() => {
    if (defaultStore?.value) {
      fetchSalesRepData(defaultStore?.value);
    }
  }, [defaultStore]);

  const openPrescriptionModel = (PM) => {
    setSelectedCust(PM);
    setPrescriptionModelVisible(true);
  };

  const closePrescriptionModel = () => {
    setPrescriptionModelVisible(false);
    setSelectedCust(null);
  };

  const openOrderModel = (OM) => {
    setSalesOrderData(OM);
    setOrderModelVisible(true);
  };

  const closeOrderModel = () => {
    setOrderModelVisible(false);
    setSalesOrderData(null);
  };

  const calculateRecallDate = (months) => {
    const today = new Date();
    const recallDate = new Date(today);
    recallDate.setMonth(today.getMonth() + months);
    const day = String(recallDate.getDate()).padStart(2, "0");
    const month = String(recallDate.getMonth() + 1).padStart(2, "0");
    const year = recallDate.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!InventoryPairs || InventoryPairs.length === 0) {
      return;
    }

    if (validateForm()) {
      try {
        let recall;
        if (formData.recallOption === "other") {
          const date = new Date(formData.recallDate);
          const day = String(date.getDate()).padStart(2, "0");
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const year = date.getFullYear();
          recall = `${day}-${month}-${year}`;
        } else {
          const months = parseInt(formData.recallOption) || 0;
          recall = calculateRecallDate(months);
        }
        let formattedRecall = null;

        if (recall && /^\d{4}-\d{2}-\d{2}$/.test(recall)) {
          const date = new Date(recall);
          if (!isNaN(date)) {
            formattedRecall = date.toISOString();
          }
        }
        console.log("formattedRecall", formattedRecall);

        const payload = {
          store: defaultStore?.value || "",
          customerId: formData.customerId,
          customerName: formData.customerName,
          customerPhone: formData.customerPhone,
          salesRep: formData.salesRep,
          products: transformInventoryPairs(InventoryPairs),
          totalAmount: Number(formData.totalAmount) || 0,
          totalQuantity: Number(formData.totalQuantity) || 0,
          totalTax: Number(formData.totalTax) || 0,
          totalDiscount: null,
          flatDiscount: Number(formData.flatDiscount) || 0,
          couponDiscount: Number(formData.couponDiscount) || 0,
          netDiscount: Number(formData.netDiscount) || 0,
          deliveryCharges: 0,
          otherCharges: Number(formData.otherCharges) || 0,
          netAmount: Number(formData.netAmount) || 0,
          receivedAmount: receivedAmounts.map((amount) => ({
            method: amount.method,
            amount: Number(amount.amount),
            date: new Date(amount.date).toISOString(),
            reference: amount.reference,
          })),
          coupon: formData.coupon || "",
          coupons: formData.coupon ? [formData.coupon] : [],
          incentiveAmount: "",
          note: formData.note,
          powerAtTime: {},
          attachments: documentsFiles,
          recall: "12-07-2001",
        };

        console.log("Submitting form with payload:", payload);

        const response = await saleService.addSales(payload);
        if (response.success) {
          toast.success("Sale submitted successfully");
        } else {
          toast.error(response.message || "Failed to submit sale");
        }
      } catch (error) {
        console.error("Error submitting form:", error);
      }
    }
  };

  const calculateTotals = () => {
    let totalQuantity = 0;
    let totalAmount = 0;
    let taxAmount = 0;
    let totalDiscount = 0;
    let flatDiscount = Number(formData.flatDiscount) || 0;
    let couponDiscount = Number(formData.couponDiscount) || 0;
    let otherCharges = Number(formData.otherCharges) || 0;

    inventoryData.forEach((pair) => {
      if (pair.data) {
        totalQuantity += 1 || 0;
        totalAmount += pair.totalAmount || 0;
        taxAmount += pair.taxAmount || 0;
        totalDiscount += pair.discount || 0;
      }
    });

    totalDiscount += flatDiscount + couponDiscount;
    const netAmount =
      totalAmount - flatDiscount + otherCharges - couponDiscount;

    setFormData((prev) => ({
      ...prev,
      totalQuantity,
      totalAmount,
      totalTax: taxAmount,
      netDiscount: totalDiscount,
      netAmount,
    }));
  };

  useEffect(() => {
    calculateTotals();
  }, [
    inventoryData,
    formData.flatDiscount,
    formData.otherCharges,
    formData.couponDiscount,
  ]);
  console.log("defaultStore<<<", defaultStore);

  return (
    <form className="container-fluid px-5" onSubmit={handleSubmit}>
      <div className="row d-flex align-items-stretch">
        <div className="col-lg-9 col-md-6 col-12 p-0">
          <div className="border h-100 border-black p-4 bg-white d-flex flex-column gap-4">
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
              <AsyncSelect
                cacheOptions
                loadOptions={loadCustomerOptions}
                onChange={async (selectedOption) => {
                  const customer = selectedOption?.data || {};
                  setFormData({
                    ...formData,
                    customerId: customer._id || "",
                    customerName: customer.name || "",
                    customerPhone: customer.phone || "",
                    prescriptions: customer.prescriptions || [],
                  });
                  if (customer._id) {
                    await loadCustomerSalesData(customer._id);
                  }
                }}
                placeholder="Search or select customer..."
              />
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
                  disabled
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
                  disabled
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
                  {salesRepData?.map((rep) => (
                    <option key={rep._id} value={rep._id}>
                      {rep.name}
                    </option>
                  ))}
                </select>
                {errors.salesRep && (
                  <div className="invalid-feedback">{errors.salesRep}</div>
                )}
              </div>
            </div>

            <div className="d-flex gap-2 justify-content-left w-100">
              {formData.customerId && (
                <>
                  <div className="btn-container">
                    <button
                      type="button"
                      className="btn border-secondary-subtle text-primary"
                      onClick={() =>
                        openPrescriptionModel(formData.prescriptions)
                      }
                    >
                      View Prescriptions
                    </button>
                  </div>
                  <div className="btn-container">
                    <button
                      type="button"
                      className="btn border-secondary-subtle text-primary"
                      onClick={() => openOrderModel(salesData)}
                    >
                      View Orders
                    </button>
                  </div>
                  <div className="btn-container">
                    <button
                      type="button"
                      className="btn border-secondary-subtle text-primary"
                      onClick={() => navigate(`/users/${formData.customerId}`)}
                    >
                      Add Power
                    </button>
                  </div>
                </>
              )}
            </div>

            {PrescriptionModelVisible && selectedCust && (
              <PrescriptionModel
                closePrescriptionModel={closePrescriptionModel}
                selectedCust={selectedCust}
              />
            )}

            {OrderModelVisible && SalesOrderData && (
              <OrdersModel
                closeOrderModel={closeOrderModel}
                SalesOrderData={SalesOrderData}
              />
            )}

            <div className="row">
              <div className="col-md-6 col-12">
                <ProductSelector
                  showProductSelector={showProductSelector}
                  defaultStore={defaultStore}
                  setInventoryData={setInventoryData}
                  setShowProductSelector={setShowProductSelector}
                  setInventoryPairs={setInventoryPairs}
                />
                {!showProductSelector && (
                  <button
                    type="button"
                    className="btn btn-sm btn-primary my-2 w-25"
                    onClick={() => setShowProductSelector(true)}
                  >
                    Add Another Pair
                  </button>
                )}
              </div>

              <div className="col-md-6 col-12">
                <label htmlFor="recallOption" className="custom-label">
                  Recall Date <span className="text-danger">*</span>
                </label>
                {formData.recallOption !== "other" ? (
                  <AsyncSelect
                    cacheOptions
                    defaultOptions={recallOptions}
                    loadOptions={loadRecallOptions}
                    value={
                      recallOptions.find(
                        (opt) => opt.value === formData.recallOption
                      ) || null
                    }
                    onChange={(selected) => {
                      setFormData({
                        ...formData,
                        recallOption: selected ? selected.value : "",
                        recallDate: "",
                      });
                      if (errors.recallOption || errors.recallDate) {
                        setErrors({
                          ...errors,
                          recallOption: "",
                          recallDate: "",
                        });
                      }
                    }}
                    placeholder="Select..."
                    className={errors.recallOption ? "is-invalid" : ""}
                  />
                ) : (
                  <DatePicker
                    selected={
                      formData.recallDate ? new Date(formData.recallDate) : null
                    }
                    onChange={(date) => {
                      setFormData({
                        ...formData,
                        recallDate: date
                          ? date.toISOString().split("T")[0]
                          : "",
                      });
                      if (errors.recallDate) {
                        setErrors({ ...errors, recallDate: "" });
                      }
                    }}
                    className={`form-control ${
                      errors.recallDate ? "is-invalid" : ""
                    }`}
                    placeholderText="Select date"
                    dateFormat="yyyy-MM-dd"
                    required
                  />
                )}
                {errors.recallOption && (
                  <div className="invalid-feedback">{errors.recallOption}</div>
                )}
                {errors.recallDate && (
                  <div className="invalid-feedback">{errors.recallDate}</div>
                )}
              </div>
            </div>

            <InventoryData
              inventoryData={inventoryData}
              setInventoryData={setInventoryData}
              setInventoryPairs={setInventoryPairs}
            />
          </div>
        </div>

        <div className="col-lg-3 col-md-6 col-12 p-0">
          <div className="border border-black p-4 bg-white">
            <div className="mb-3 w-100">
              <div className="d-flex align-items-center gap-2 mb-1">
                <label className="custom-label" htmlFor="store">
                  Store
                </label>
              </div>
              <AsyncSelect
                cacheOptions
                defaultOptions={filteredStores}
                loadOptions={loadStoreOptions}
                value={defaultStore}
                onChange={(selected) => {
                  setDefaultStore(selected);
                  setFormData((prev) => ({ ...prev, store: selected.label }));
                }}
                isDisabled={filteredStores.length === 1}
              />
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
                <label className="custom-label" htmlFor={field.name}>
                  {field.label}
                </label>
                <div className="flex-grow-1">
                  <input
                    type="number"
                    className={`form-control w-100 ${
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

            <div className="border border-black rounded p-2">
              <label className="custom-label d-block">Coupon</label>
              <div>
                <input
                  type="text"
                  className="form-control w-100"
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
                  onClick={() =>
                    checkingCouponCode(
                      formData.coupon,
                      formData.customerPhone,
                      InventoryPairs
                    )
                  }
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
        <div className="ms-0 row border border-black">
          <div className="col-12 border-end col-md-6 p-0">
            <div className="p-3 bg-white">
              <div className="d-flex justify-content-end">
                <span>Due Amount: {formData.netAmount}</span>
              </div>
              <div className="d-flex align-items-center gap-3">
                <label className="custom-label">Received Amount</label>
                <button
                  type="button"
                  className="btn px-3 py-2"
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
                  <></>
                ) : (
                  receivedAmounts.map((amount, index) => (
                    <div
                      className="row align-items-center px-3 mb-3"
                      key={index}
                    >
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
                      <div className="col-md-3 p-1">
                        <input
                          type="number"
                          className={`form-control ${
                            errors[`receivedAmount.${index}.amount`]
                              ? "is-invalid"
                              : ""
                          }`}
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
                        {errors[`receivedAmount.${index}.amount`] && (
                          <div className="invalid-feedback">
                            {errors[`receivedAmount.${index}.amount`]}
                          </div>
                        )}
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
                          className={`form-control ${
                            errors[`receivedAmount.${index}.date`]
                              ? "is-invalid"
                              : ""
                          }`}
                          placeholderText="Select date"
                          dateFormat="yyyy-MM-dd"
                          required
                        />
                        {errors[`receivedAmount.${index}.date`] && (
                          <div className="invalid-feedback">
                            {errors[`receivedAmount.${index}.date`]}
                          </div>
                        )}
                      </div>
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

          <div className="col-12 col-md-6 p-0">
            <div className="p-3 bg-white">
              <div className="d-flex align-items-center gap-3 mb-3">
                <button
                  type="button"
                  className="btn px-3 py-2"
                  style={{
                    borderColor: "#e2e8f0",
                    color: "#4f46e5",
                    fontSize: "0.875rem",
                  }}
                  onMouseOver={(e) => (e.target.style.borderColor = "#cbd5e1")}
                  onMouseOut={(e) => (e.target.style.borderColor = "#e2e8f0")}
                  onClick={addDocumentInput}
                >
                  Attach More Documents
                </button>
              </div>
              <div className="mt-3">
                {documents.length === 0 ? (
                  <p>No documents added.</p>
                ) : (
                  documents.map((doc, index) => (
                    <div className="row align-items-center mb-3" key={index}>
                      <div className="col-md-5 p-1">
                        <label
                          className="d-block text-sm font-medium mb-1"
                          htmlFor={`documents.${index}.documentName`}
                        >
                          Document Name
                        </label>
                        <div className="d-flex align-items-center">
                          <input
                            type="text"
                            className="form-control"
                            id={`documents.${index}.documentName`}
                            name={`documents.${index}.documentName`}
                            value={doc.documentName}
                            onChange={(e) =>
                              handleDocumentChange(
                                index,
                                "documentName",
                                e.target.value
                              )
                            }
                          />
                          <button
                            type="button"
                            onClick={() => removeDocumentInput(index)}
                            className="btn p-0 ms-2"
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
                              stroke="red"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div className="col-md-7 p-1">
                        <label
                          className="d-block text-sm font-medium mb-1"
                          htmlFor={`documents.${index}.documentFile`}
                        >
                          Document File
                        </label>
                        <input
                          type="file"
                          className="form-control"
                          id={`documents.${index}.documentFile`}
                          name={`documents.${index}.documentFile`}
                          accept=".pdf,.doc,.docx,.jpg,.png"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            handleDocumentChange(index, "documentFile", file);
                            if (file) {
                              uploadDocument(
                                file,
                                doc.documentName || file.name,
                                index
                              );
                            }
                          }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 mb-5 p-0 mt-3">
          <button type="submit" className="btn btn-primary py-2">
            Submit
          </button>
        </div>
      </div>
    </form>
  );
};

export default SaleForm;
