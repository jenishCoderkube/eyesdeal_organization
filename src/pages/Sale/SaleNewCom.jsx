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
  });

  const [receivedAmounts, setReceivedAmounts] = useState([]);
  const [errors, setErrors] = useState({});
  const [salesData, setSalesData] = useState([]);
  const [salesRepData, setSalesRepData] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [defaultStore, setDefaultStore] = useState(null);
  const [showProductSelector, setShowProductSelector] = useState(true);
  const [PrescriptionModelVisible, setPrescriptionModelVisible] = useState(false);
  const [selectedCust, setSelectedCust] = useState(null);
  const [OrderModelVisible, setOrderModelVisible] = useState(false);
  const [SalesOrderData, setSalesOrderData] = useState(null);
  const [inventoryData, setInventoryData] = useState([]);
  const [InventoryPairs, setInventoryPairs] = useState([]);

  useEffect(() => {
    const fetchStoresData = async () => {
      try {
        const allStores = await storeService.getStores();
        const userStoreIds = user?.stores || [];

        const matchedStores = allStores
          .filter(store => userStoreIds.includes(store._id))
          .map(store => ({
            value: store._id,
            label: `${store.storeNumber} / ${store.name}`,
            data: store,
          }));

        setFilteredStores(matchedStores);
        if (matchedStores.length === 1) {
          const defaultStore = matchedStores[0];
          setDefaultStore(defaultStore);
          setFormData(prev => ({ ...prev, store: defaultStore.label }));
        }
      } catch (error) {
        console.error("Error fetching stores:", error);
      }
    };

    fetchStoresData();
  }, []);

  const loadStoreOptions = (inputValue, callback) => {
    const filtered = filteredStores.filter(option => option.label.toLowerCase().includes(inputValue.toLowerCase()));
    callback(filtered);
  };

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
    if (!formData.customerName) newErrors.customerName = "Customer Name is required";
    if (!formData.customerPhone) newErrors.customerPhone = "Customer Phone is required";
    if (!formData.salesRep) newErrors.salesRep = "Sales Rep is required";
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

  const removeReceivedAmount = (index) => {
    const updatedAmounts = receivedAmounts.filter((_, i) => i !== index);
    setReceivedAmounts(updatedAmounts);
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
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
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
      console.error("Error fetching customers:", error);
    }
  };

  const fetchSalesRepData = async (storeId) => {
    try {
      const response = await saleService.getSalesRep(storeId);
      if (response.success) {
        setSalesRepData(response.data.data.docs)
      } else {
        console.error(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching stores:", error);
    }
  };

  const checkingCouponCode = async (coupon, customerPhone, products) => {
    try {
      const response = await saleService.checkCouponCode(coupon, customerPhone, products);
      if (response.success) {
        console.log(response.data);
      } else {
        console.error(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching stores:", error);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("Form submitted:", formData);
    }
  };

  console.log(InventoryPairs)
  return (
    <form className="container-fluid px-5" onSubmit={handleSubmit}>
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
                  loadCustomerSalesData(customer._id);
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
                  className={`form-control custom-disabled w-100 ${errors.customerName ? "is-invalid" : ""
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
                  className={`form-control custom-disabled w-100 ${errors.customerPhone ? "is-invalid" : ""
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
                  className={`form-select w-100 ${errors.salesRep ? "is-invalid" : ""
                    }`}
                  id="salesRep"
                  name="salesRep"
                  value={formData.salesRep}
                  onChange={handleInputChange}
                  style={{ color: "#808080" }}
                >
                  <option value="">Select...</option>
                  {salesRepData && (
                    <>
                      {salesRepData?.map((rep) => (
                        <option key={rep._id} value={rep._id}>
                          {rep.name}
                        </option>
                      ))}
                    </>
                  )}
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
                      onClick={() => openPrescriptionModel(formData.prescriptions)}
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

            {!showProductSelector && (
              <button
                className="btn btn-sm btn-primary my-2 w-25"
                onClick={() => setShowProductSelector(true)}
              >
                Add Another Pair
              </button>
            )}

            {/* Product Selector */}
            <ProductSelector
              showProductSelector={showProductSelector}
              defaultStore={defaultStore}
              setInventoryData={setInventoryData}
              setShowProductSelector={setShowProductSelector}
              setInventoryPairs={setInventoryPairs} />

            {/* Product List */}
            <InventoryData inventoryData={inventoryData} setInventoryData={setInventoryData} setInventoryPairs={setInventoryPairs}/>

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

              <AsyncSelect
                cacheOptions
                defaultOptions={filteredStores}
                loadOptions={loadStoreOptions}
                value={defaultStore}
                onChange={(selected) => {
                  setDefaultStore(selected);
                  setFormData(prev => ({ ...prev, store: selected.label }));
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
                    className={`form-control w-auto ${field.readOnly ? "custom-disabled" : ""
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

        <div className="col-12 mb-5 p-0 mt-3">
          <button type="submit" className="btn btn-primary py-2">
            Submit
          </button>
        </div>
      </div>
    </form >
  );
};

export default SaleForm;
