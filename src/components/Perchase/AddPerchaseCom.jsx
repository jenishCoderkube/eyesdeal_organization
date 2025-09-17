import React, { useEffect, useState, useMemo } from "react";
import "../../assets/css/Sale/sale_style.css";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import * as XLSX from "xlsx";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import { purchaseService } from "../../services/purchaseService";
import { toast } from "react-toastify";
import debounce from "lodash/debounce";
import "bootstrap/dist/css/bootstrap.min.css";
import { inventoryService } from "../../services/inventoryService";

const AddPerchaseCom = () => {
  const [formData, setFormData] = useState({
    vendor: null,
    invoiceNumber: "",
    invoiceDate: new Date(),
    isDelivered: true,
    product: null,
    store: null,
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
  const [inventoryData, setInventoryData] = useState([]);
  const [errors, setErrors] = useState({
    vendor: "",
    invoiceNumber: "",
    invoiceDate: "",
    product: "",
    store: "",
  });
  const [loading, setLoading] = useState(false);
  const [vendorData, setVendorData] = useState([]);
  const [storeData, setStoreData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [loadBaseSubmit, setLoadBaseSubmit] = useState(false);
  const users = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const vendorOptions = vendorData?.docs?.map((vendor) => ({
    value: vendor._id,
    label: vendor.companyName,
  }));
  console.log("productData", productData);

  const productOptions = productData?.docs?.map((product) => ({
    value: product._id,
    label: `${product?.newBarcode} / ${product?.sku} / ${product?.displayName}`,
  }));

  const storeOptions = storeData
    .filter((store) => users.stores.includes(store._id))
    .map((store) => ({
      value: store._id,
      label: `${store.name} / ${store.companyName}`,
    }));

  // Debounced getProduct function
  const debouncedGetProduct = useMemo(
    () =>
      debounce(async (search) => {
        setLoading(true);
        try {
          const response = await purchaseService.searchProduct(search);
          if (response.success) {
            setProductData(response?.data?.data);
          } else {
            toast.error(response.message);
          }
        } catch (error) {
          console.error("Product search error:", error);
          toast.error("Failed to search products");
        } finally {
          setLoading(false);
        }
      }, 300),
    []
  );

  // Calculate dependent fields for a product
  const calculateProductFields = (product) => {
    const quantity = parseFloat(product.quantity) || 0;
    const purRate = parseFloat(product.purRate) || 0;
    const discRate = parseFloat(product.discRate) || 0;
    const tax = parseFloat(product.tax) || 0;

    let discAmount = 0;
    if (product.discType === "percentage") {
      discAmount = (purRate * discRate) / 100;
    } else if (product.discType === "amount") {
      discAmount = discRate;
    }

    const taxableAmount = purRate - discAmount;
    const taxAmount = (taxableAmount * tax) / 100;

    // If taxType is "Inc", add tax to totalAmount
    const totalAmount =
      quantity * (taxableAmount + (product.taxType === "Inc" ? taxAmount : 0));

    const totalDisc = quantity * discAmount;

    return {
      ...product,
      discAmount: discAmount.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      totalDisc: totalDisc.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
    };
  };

  // Recalculate form totals
  const updateFormTotals = (updatedProducts) => {
    const totalQuantity = updatedProducts.reduce(
      (sum, p) => sum + (parseFloat(p.quantity) || 0),
      0
    );
    const totalAmount = updatedProducts.reduce(
      (sum, p) => sum + (parseFloat(p.totalAmount) || 0),
      0
    );
    const totalTax = updatedProducts.reduce(
      (sum, p) =>
        sum + (parseFloat(p.taxAmount) * (parseFloat(p.quantity) || 0) || 0),
      0
    );
    const totalDiscount = updatedProducts.reduce(
      (sum, p) => sum + (parseFloat(p.totalDisc) || 0),
      0
    );
    const netAmount =
      totalAmount +
      parseFloat(formData.otherCharges || 0) -
      parseFloat(formData.flatDiscount || 0);

    setFormData((prev) => ({
      ...prev,
      totalQuantity,
      totalAmount: totalAmount.toFixed(2),
      totalTax: totalTax.toFixed(2),
      totalDiscount: totalDiscount.toFixed(2),
      netAmount: netAmount.toFixed(2),
    }));
  };

  const handleInputChange = (name, value) => {
    setFormData((prev) => {
      const updatedForm = { ...prev, [name]: value };

      // If discount or charges change, recalc totals
      if (name === "flatDiscount" || name === "otherCharges") {
        updateFormTotals(products, updatedForm);
      }

      return updatedForm;
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectChange = (name, option) => {
    setFormData((prev) => ({ ...prev, [name]: option }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (name === "product" && option) {
      handleAddProduct(option);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.vendor) newErrors.vendor = "Vendor is required";
    if (!formData.invoiceNumber.trim())
      newErrors.invoiceNumber = "Invoice Number is required";
    if (!formData.invoiceDate)
      newErrors.invoiceDate = "Invoice Date is required";
    if (products.length === 0)
      newErrors.product = "At least one product must be selected";
    if (!formData.store) newErrors.store = "Store is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddProduct = (selectedOption) => {
    if (selectedOption) {
      const selectedProduct = productData?.docs?.find(
        (p) => p._id === selectedOption.value
      );
      if (selectedProduct) {
        const newProduct = {
          id: selectedProduct._id,
          barcode: selectedProduct.newBarcode,
          sku: selectedProduct.sku,
          quantity: 1,
          mrp: selectedProduct.MRP,
          purRate: selectedProduct.costPrice,
          discType: "amount",
          discRate: 0,
          discAmount: 0,
          tax: selectedProduct.tax,
          taxType: "Inc",
          taxAmount: 0,
          totalDisc: 0,
          totalAmount: 0,
        };
        const calculatedProduct = calculateProductFields(newProduct);
        const updatedProducts = [...products, calculatedProduct].reverse();
        setProducts(updatedProducts);
        updateFormTotals(updatedProducts);
        setFormData((prev) => ({ ...prev, product: null }));
        setErrors((prev) => ({ ...prev, product: "" }));
      }
    }
  };
  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...products];
    let parsedValue = value;

    // Ensure numeric fields are treated as numbers
    if (["quantity", "purRate", "discRate", "tax"].includes(field)) {
      parsedValue = value === "" ? "" : parseFloat(value);
    }

    updatedProducts[index] = {
      ...updatedProducts[index],
      [field]: parsedValue,
    };

    const calculatedProduct = calculateProductFields(updatedProducts[index]);
    updatedProducts[index] = calculatedProduct;

    setProducts(updatedProducts);
    updateFormTotals(updatedProducts);
  };

  const handleRemoveProduct = (index) => {
    const updatedProducts = products.filter((_, i) => i !== index);
    setProducts(updatedProducts);
    updateFormTotals(updatedProducts);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadBaseSubmit(true);
    if (validateForm()) {
      const payload = {
        store: formData.store?.value || "",
        vendor: formData.vendor?.value || "",
        invoiceNumber: formData.invoiceNumber,
        invoiceDate: formData.invoiceDate.getTime(),
        notes: formData.notes || null,
        isDelivered: formData.isDelivered,
        totalAmount: formData.totalAmount.toString(),
        totalQuantity: formData.totalQuantity,
        totalTax: formData.totalTax.toString(),
        totalDiscount: formData.totalDiscount.toString(),
        flatDiscount: formData.flatDiscount.toString(),
        netDiscount: formData.totalDiscount.toString(),
        deliveryCharges: "0.00",
        otherCharges: formData.otherCharges.toString(),
        netAmount: formData.netAmount.toString(),
        products: products.map((product) => ({
          product: product.id,
          barcode: product.barcode,
          sku: product.sku,
          quantity: product.quantity,
          mrp: product.mrp,
          purchaseRate: product.purRate,
          discountType: product.discType,
          discountRate: product.discRate,
          discountAmount: product.discAmount,
          taxType: product.taxType,
          taxAmount: product.taxAmount,
          tax: product.tax,
          totalDiscount: product.totalDisc,
          totalAmount: product.totalAmount,
        })),
      };

      try {
        const response = await purchaseService.addInventory(payload);
        if (response.success) {
          toast.success("Inventory added successfully!");
          // Reset form data
          setFormData({
            vendor: null,
            invoiceNumber: "",
            invoiceDate: new Date(),
            isDelivered: true,
            product: null,
            store: null,
            totalQuantity: 0,
            totalAmount: 0,
            totalTax: 0,
            totalDiscount: 0,
            flatDiscount: 0,
            otherCharges: 0,
            netAmount: 0,
            notes: "",
          });
          setProducts([]);
          setInventoryData([]);
          setErrors({
            vendor: "",
            invoiceNumber: "",
            invoiceDate: "",
            product: "",
            store: "",
          });
          navigate("/purchase/list");
        } else {
          toast.error(response.message);
        }
      } catch (error) {
        console.error("Error adding inventory:", error);
        toast.error("Failed to add inventory");
      } finally {
        setLoadBaseSubmit(false);
      }
    } else {
      setLoadBaseSubmit(false);
    }
  };

  useEffect(() => {
    getStores();
    getVendor();
    getProduct("");
  }, []);

  const TAX_OPTIONS = [
    { value: "Inc", label: "Inc" },
    { value: "Exc", label: "Exc" },
  ];
  const getVendor = async () => {
    setLoading(true);
    try {
      const response = await purchaseService.getVendors();
      if (response.success) {
        setVendorData(response?.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Vendor error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStores = async () => {
    setLoading(true);
    try {
      const response = await purchaseService.getStores();
      if (response.success) {
        setStoreData(response?.data?.data);
        // Optionally set default store if needed
        const userStores = response?.data?.data.filter((store) =>
          users.stores.includes(store._id)
        );
        if (userStores.length > 0) {
          setFormData((prev) => ({
            ...prev,
            store: {
              value: userStores[0]._id,
              label: `${userStores[0].name} / ${userStores[0].companyName}`,
            },
          }));
        }
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Stores error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getProduct = async (search) => {
    setLoading(true);
    try {
      const response = await purchaseService.searchProduct(search);
      if (response.success) {
        setProductData(response?.data?.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Product error:", error);
    } finally {
      setLoading(false);
    }
  };

  const discTypeOptions = [
    { value: "percentage", label: "Percentage" },
    { value: "amount", label: "Amount" },
  ];

  // const handleFileUpload = (event) => {
  //   const file = event.target.files[0];
  //   if (!file) return;

  //   // Validate vendor and invoiceNumber
  //   let validationErrors = {};
  //   if (!formData.vendor || !formData.vendor.value) {
  //     validationErrors.vendor = "Vendor is required";
  //   }
  //   if (!formData.invoiceNumber.trim()) {
  //     validationErrors.invoiceNumber = "Invoice Number is required";
  //   }
  //   // Update errors state if there are validation issues
  //   if (Object.keys(validationErrors).length > 0) {
  //     event.target.value = null;
  //     setErrors(validationErrors);
  //     return;
  //   }
  //   const reader = new FileReader();
  //   reader.onload = (e) => {
  //     const binaryStr = e.target.result;
  //     const workbook = XLSX.read(binaryStr, { type: "binary" });
  //     const sheetName = workbook.SheetNames[0];
  //     const sheet = workbook.Sheets[sheetName];

  //     // Convert to JSON
  //     const jsonData = XLSX.utils.sheet_to_json(sheet);
  //     setInventoryData(jsonData);
  //     uploadInventoryFile(jsonData);
  //   };
  //   reader.readAsBinaryString(file);
  // };

  // const uploadInventoryFile = async (jsonData) => {
  //   const payload = {
  //     vendorId: formData.vendor.value,
  //     invoiceNumber: formData.invoiceNumber,
  //     date: formData.invoiceDate.getTime(),
  //     store: formData.store?.value,
  //     isDelivered: formData.isDelivered,
  //     inventoryData: jsonData,
  //   };

  //   try {
  //     const response = await inventoryService.uploadInventory(payload);
  //     if (response.success) {
  //       toast.success(response.data.message);
  //       window.location.reload();
  //     } else {
  //       toast.error(response.message);
  //     }
  //   } catch (error) {
  //     console.error("Product error:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <div className="container-fluid p-2">
      <form onSubmit={handleSubmit}>
        <div className="row px-3">
          {/* Left Section */}
          <div
            className="col-lg-10 col-md-12 px-0"
            style={{ overflowY: "auto" }}
          >
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
              {/* <div className="mt-4">
                <div className="form-check">
                  <input
                    type="file"
                    className="form-control-file"
                    accept=".xls,.xlsx"
                    onChange={handleFileUpload}
                  />
                </div>
              </div> */}
              <div className="mt-4">
                <label className="form-label fw-medium mb-2">Product</label>
                <Select
                  options={productOptions}
                  value={formData.product}
                  onChange={(option) => handleSelectChange("product", option)}
                  placeholder="Select..."
                  classNamePrefix="react-select"
                  className={`custom-select flex-grow-1 ${
                    errors.product ? "is-invalid" : ""
                  }`}
                  onInputChange={(value) => {
                    setProductSearchQuery(value);
                    debouncedGetProduct(value);
                  }}
                  isLoading={loading}
                />
                {errors.product && (
                  <div className="invalid-feedback d-block">
                    {errors.product}
                  </div>
                )}
              </div>
              <div className="table-responsive mt-3">
                <table
                  className="table table-sm"
                  style={{ minHeight: "250px", whiteSpace: "nowrap" }}
                >
                  <thead className="uppercase text-slate-500 bg-slate-50 border-top border-bottom">
                    <tr>
                      <th className="px-2 py-3 custom-perchase-th"></th>
                      <th className="px-3 py-3 custom-perchase-th">Barcode</th>
                      <th className="px-5 py-3 custom-perchase-th">SKU</th>
                      <th className="px-3 py-3 custom-perchase-th">Quantity</th>
                      <th className="px-4 py-3 custom-perchase-th">MRP</th>
                      <th className="px-3 py-3 custom-perchase-th">PUR Rate</th>

                      <th className="px-4 py-3 custom-perchase-th">
                        DISC Type
                      </th>
                      <th className="px-3 py-3 custom-perchase-th">
                        DISC Rate
                      </th>
                      <th className="px-3 py-3 custom-perchase-th">
                        DISC Amount
                      </th>
                      <th className="px-3 py-3 custom-perchase-th">Tax Type</th>

                      <th className="px-3 py-3 custom-perchase-th">Tax</th>
                      <th className="px-3 py-3 custom-perchase-th">Tax AMT</th>
                      <th className="px-3 py-3 custom-perchase-th">
                        Total DISC
                      </th>
                      <th className="px-3 py-3 custom-perchase-th">
                        Total AMT
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan="13" className="text-center py-3">
                          No products added
                        </td>
                      </tr>
                    ) : (
                      [...products].map((product, index) => (
                        <tr key={product.id}>
                          <td className="p-2 text-center">
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
                              className="cursor-pointer text-danger"
                              onClick={() => handleRemoveProduct(index)}
                            >
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              className="form-control form-control-sm bg-secondary-subtle"
                              readOnly
                              value={product.barcode}
                            />
                          </td>
                          <td className="p-2">
                            <textarea
                              className="form-control form-control-sm bg-secondary-subtle"
                              rows="4"
                              readOnly
                              value={product.sku}
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              min="0"
                              value={product.quantity}
                              onChange={(e) =>
                                handleProductChange(
                                  index,
                                  "quantity",
                                  e.target.value
                                )
                              }
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              className="form-control form-control-sm bg-secondary-subtle"
                              readOnly
                              value={product.mrp}
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              min="0"
                              value={product.purRate}
                              onChange={(e) =>
                                handleProductChange(
                                  index,
                                  "purRate",
                                  e.target.value
                                )
                              }
                            />
                          </td>
                          <td className="p-2">
                            <select
                              className="form-select form-select-sm"
                              value={product.discType}
                              onChange={(e) =>
                                handleProductChange(
                                  index,
                                  "discType",
                                  e.target.value
                                )
                              }
                            >
                              {discTypeOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              className="form-control form-control-sm "
                              min="0"
                              value={product.discRate}
                              onChange={(e) =>
                                handleProductChange(
                                  index,
                                  "discRate",
                                  e.target.value
                                )
                              }
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              className="form-control form-control-sm bg-secondary-subtle"
                              readOnly
                              value={product.discAmount}
                            />
                          </td>
                          <td style={{ minWidth: "120px" }}>
                            <Select
                              options={TAX_OPTIONS}
                              value={TAX_OPTIONS.find(
                                (t) => t.value === product.taxType
                              )}
                              styles={{
                                menuPortal: (base) => ({
                                  ...base,
                                  zIndex: 9999,
                                  fontSize: "10px",
                                }),
                                control: (base) => ({
                                  ...base,
                                  minHeight: "35px",
                                  height: "35px",
                                  fontSize: "14px",
                                }),
                                menu: (base) => ({
                                  ...base,
                                  fontSize: "14px",
                                  marginTop: "0px", // make sure it's above everything
                                }),
                                option: (base) => ({
                                  ...base,
                                  padding: "4px 8px",
                                }),
                              }}
                              onChange={(selected) =>
                                handleProductChange(
                                  index,
                                  "taxType",
                                  selected.value
                                )
                              }
                              isDisabled={loading}
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              className="form-control form-control-sm bg-secondary-subtle"
                              readOnly
                              value={product.tax}
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              className="form-control form-control-sm bg-secondary-subtle"
                              readOnly
                              value={product.taxAmount}
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              className="form-control form-control-sm bg-secondary-subtle"
                              readOnly
                              value={product.totalDisc}
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              className="form-control form-control-sm bg-secondary-subtle"
                              readOnly
                              value={product.totalAmount}
                            />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          {/* Right Section - Summary */}
          <div className="col-lg-2 col-md-12 px-0">
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
                  placeholder="Select..."
                  classNamePrefix="react-select"
                  className={`custom-select ${
                    errors.store ? "is-invalid" : ""
                  }`}
                  isDisabled={storeOptions.length <= 1}
                />
                {errors.store && (
                  <div className="invalid-feedback">{errors.store}</div>
                )}
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
                  <label
                    className="form-label mb-0"
                    style={{ minWidth: "80px" }}
                    htmlFor={field.name}
                  >
                    {field.label}
                  </label>
                  <input
                    type="number"
                    name={field.name}
                    className={`form-control w-fit ${
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
          {loadBaseSubmit ? (
            <button
              class="btn custom-button-bgcolor w-auto"
              type="button"
              disabled
            >
              <span
                class="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              ></span>
              Loading...
            </button>
          ) : (
            <button
              type="submit"
              className="btn mt-2 mb-5 px-4 py-2 custom-button-bgcolor w-auto"
            >
              Submit
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AddPerchaseCom;
