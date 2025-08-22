import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AsyncSelect from "react-select/async";
import Select from "react-select";
import DatePicker from "react-datepicker";

import "../../assets/css/Sale/sale_style.css";
import "react-datepicker/dist/react-datepicker.css";

import { saleService } from "../../services/saleService";
import { storeService } from "../../services/storeService";

import PrescriptionModel from "../../components/Process/PrescriptionModel";
import OrdersModel from "../../components/Process/OrdersModel";
import HeaderTitle from "../../components/CommonTitle/HeaderTitle";

const SaleReturn = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [formData, setFormData] = useState({
    customer: null,
    customerName: "",
    customerPhone: "",
    salesRep: null,
    store: null,
  });

  const [salesRepData, setSalesRepData] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [defaultStore, setDefaultStore] = useState(null);

  const [salesData, setSalesData] = useState(null);
  const [ordersData, setOrdersData] = useState([]);
  const [salesId, setSalesId] = useState(null);
  const [productOptions, setProductOptions] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);

  const [selectedDate, setSelectedDate] = useState(new Date()); // State for the date
  const [SalesOrderData, setSalesOrderData] = useState(null);
  const [PrescriptionModelVisible, setPrescriptionModelVisible] =
    useState(false);
  const [OrderModelVisible, setOrderModelVisible] = useState(false);

  const [selectedCust, setSelectedCust] = useState(null);
  const [errors, setErrors] = useState({
    customerName: "",
    customerPhone: "",
    salesRep: "",
  });

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

        setFilteredStores(matchedStores);

        if (matchedStores.length === 1) {
          const defaultStore = matchedStores[0];
          setDefaultStore(defaultStore);
          setFormData((prev) => ({ ...prev, store: defaultStore.data }));
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

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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

  const fetchSalesRepData = async (storeId) => {
    try {
      const response = await saleService.getSalesRep(storeId);
      if (response.success) {
        setSalesRepData(response.data.data.docs);
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

  const fetchOrderData = async (id) => {
    try {
      const response = await saleService.sales(id);
      if (response.success) {
        setSalesData(response.data.data);
        setSalesId(response.data.data?.docs?.[0]._id);

        const filteredOrders = response.data.data?.docs?.[0].orders.map(
          (order) => ({
            value: order._id,
            label: order.billNumber,
            data: order,
          })
        );
        setOrdersData(filteredOrders);
      } else {
        console.error(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const fetchProductData = async (data) => {
    try {
      const options = [];

      if (data.lens) {
        options.push({
          label: data.lens.displayName,
          value: data.lens.barcode,
          data: data.lens,
        });
      }

      if (data.product) {
        options.push({
          label: data.product.displayName,
          value: data.product.barcode,
          data: data.product,
        });
      }
      setProductOptions(options);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  useEffect(() => {
    const total = inventoryData.reduce(
      (acc, item) => acc + parseFloat(item?.data?.srp || 0),
      0
    );
    setTotalAmount(total);
  }, [inventoryData]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleAddProduct = async (selectedProduct) => {
    const isProductExists = inventoryData.some(
      (product) => product.value === selectedProduct.value
    );
    if (isProductExists) {
      alert("Product is already in the list");
    } else {
      setInventoryData((prev) => [...prev, selectedProduct]);
    }
  };

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
              <AsyncSelect
                cacheOptions
                loadOptions={loadCustomerOptions}
                placeholder="Search or select customer..."
                onChange={async (selectedOption) => {
                  if (selectedOption) {
                    setFormData((prev) => ({
                      ...prev,
                      customer: selectedOption.data,
                    }));
                  } else {
                    setFormData((prev) => ({
                      ...prev,
                      customer: null,
                    }));
                  }
                  fetchOrderData(selectedOption?.data._id);
                }}
              />
              <input
                type="hidden"
                name="customerId"
                value={formData.customer?._id || ""}
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
                    className={`form-control custom-disabled ${
                      errors.customerName ? "is-invalid" : ""
                    }`}
                    value={formData.customer?.name}
                    disabled
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
                    className={`form-control custom-disabled ${
                      errors.customerPhone ? "is-invalid" : ""
                    }`}
                    value={formData.customer?.phone}
                    disabled
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
                  <select
                    className={`form-select w-100 ${
                      errors.salesRep ? "is-invalid" : ""
                    }`}
                    id="salesRep"
                    name="salesRep"
                    value={formData.salesRep?._id?.toString() || ""} // <<< FORCE string
                    onChange={(e) => {
                      const selectedRep = salesRepData.find(
                        (rep) => rep._id === e.target.value
                      );
                      setFormData((prev) => ({
                        ...prev,
                        salesRep: selectedRep || null,
                      }));
                    }}
                    style={{ color: "#808080" }}
                  >
                    <option value="">Select...</option>
                    {salesRepData && (
                      <>
                        {salesRepData?.map((rep) => (
                          <option key={rep._id} value={rep._id?.toString()}>
                            {rep.name}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                  <input
                    type="hidden"
                    name="salesRep"
                    value={formData.salesRep?._id || ""}
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
                  <AsyncSelect
                    cacheOptions
                    defaultOptions={filteredStores}
                    loadOptions={loadStoreOptions}
                    value={defaultStore}
                    onChange={(selected) => {
                      setDefaultStore(selected);
                      setFormData((prev) => ({
                        ...prev,
                        store: selected?.data || null,
                      }));
                    }}
                    isDisabled={filteredStores.length === 1}
                  />
                  <input
                    type="hidden"
                    name="store"
                    value={formData.store?._id || ""}
                  />
                </div>

                {formData.customer && (
                  <div>
                    <label htmlFor="customerId" className="custom-label">
                      Sale
                    </label>
                    <Select
                      options={ordersData}
                      onChange={(selectedOption) => {
                        fetchProductData(selectedOption?.data);
                      }}
                    />
                  </div>
                )}

                {productOptions.length > 0 && (
                  <div>
                    <label htmlFor="customerId" className="custom-label">
                      Product
                    </label>
                    <Select
                      options={productOptions}
                      onChange={(selectedOption) => {
                        handleAddProduct(selectedOption);
                      }}
                    />
                  </div>
                )}

                {formData.customer && (
                  <div className="d-flex gap-2 justify-content-left w-100">
                    <>
                      <div className="btn-container">
                        <button
                          type="button"
                          className="btn border-secondary-subtle text-primary"
                          onClick={() =>
                            openPrescriptionModel(
                              formData.customer?.prescriptions
                            )
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
                          onClick={() =>
                            navigate(`/users/${formData?.customer?._id}`)
                          }
                        >
                          Add Power
                        </button>
                      </div>
                    </>
                    {/* {PrescriptionModelVisible && selectedCust && (
                      <PrescriptionModel
                        closePrescriptionModel={closePrescriptionModel}
                        selectedCust={selectedCust}
                      />
                    )} */}

                    {OrderModelVisible && SalesOrderData && (
                      <OrdersModel
                        closeOrderModel={closeOrderModel}
                        SalesOrderData={SalesOrderData}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="col-12 mt-4">
              <label className="form-label mb-2">Products</label>
              <div className="table-responsive px-2">
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
                  <tbody
                    className="text-sm divide-y divide-slate-200"
                    style={{
                      fontSize: "0.875rem",
                    }}
                  >
                    {inventoryData.length === 0 ? (
                      <tr>
                        <td colSpan="10" className="text-center">
                          No products added
                        </td>
                      </tr>
                    ) : (
                      inventoryData.map((item, index) => (
                        <tr key={index}>
                          <td>{item?.data?.barcode}</td>
                          <td>
                            <input
                              type="text"
                              value={item?.data?.srp}
                              disabled
                              className="form-control-plaintext bg-secondary-subtle p-2 rounded-2"
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              value={item?.data?.sku}
                              disabled
                              className="form-control-plaintext bg-secondary-subtle p-2 rounded-2"
                            />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Total Amount Section */}
              {inventoryData.length > 0 && (
                <div className="mt-4">
                  <div className="flex">
                    <p className="font-medium text-lg">Total Amount:</p>
                    <p className="font-semibold text-xl text-green-600">
                      {totalAmount.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-lg">Flat Discount: 0</p>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-lg">Coupon Discount: 0</p>
                  </div>
                </div>
              )}
            </div>

            <div className="col-12">
              <div className="px-4 bg-light rounded">
                <div className="mb-3">
                  <label className="form-label">Pay Amount</label>
                </div>
                {inventoryData.length > 0 && (
                  <div className="row align-items-center px-3 mb-3">
                    <div className="col-md-3 p-1 d-flex align-items-center">
                      <select className="form-select" name={`receivedAmount`}>
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
                        name={`receivedAmount`}
                        defaultValue={totalAmount.toFixed(2)}
                      />
                    </div>
                    {/* Date */}
                    <div className="col-md-3 p-1">
                      <DatePicker
                        className="form-control"
                        selected={selectedDate}
                        onChange={handleDateChange}
                        dateFormat="yyyy-MM-dd"
                      />
                    </div>

                    {/* Reference */}
                    <div className="col-md-3 p-1">
                      <input
                        type="text"
                        className="form-control"
                        name={`salesId`}
                        defaultValue={salesId}
                      />
                    </div>
                  </div>
                )}
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
