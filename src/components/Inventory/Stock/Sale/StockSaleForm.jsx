import React, { useEffect, useState, useCallback } from "react";
import "react-datepicker/dist/react-datepicker.css";
import AsyncSelect from "react-select/async";
import Select from "react-select";
import debounce from "lodash.debounce";
import { storeService } from "../../../../services/storeService";
import { toast } from "react-toastify";
import { FaTrash } from "react-icons/fa";

const StockSaleForm = () => {
  const users = JSON.parse(localStorage.getItem("user"));

  const [formData, setFormData] = useState({
    from: "",
    to: "",
    product: "", // Store first product ID here
    store: "",
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

  const [errors, setErrors] = useState({});
  const [storeData, setStoreData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState([]);


  useEffect(() => {
    (async () => {
      try {
        const response = await storeService.getStores();

        setStoreData(response);

        const storeInfoId = localStorage.getItem("storeInfoId");

        if (storeInfoId) {
          const defaultStore = response?.find(
            (vendor) => vendor._id === storeInfoId
          );
          if (defaultStore) {
            setFormData((prev) => ({ ...prev, from: storeInfoId }));
          }
        }
      } catch (error) {
        console.error("Error fetching stores:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleInputChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleSelectChange = (option, { name }) => {
    const storeInfoId = localStorage.getItem("storeInfoId");

    if (storeInfoId === option.value) {
      window.alert("Same Store Transfer Not allowed");
    } else {
      handleInputChange(name, option ? option.value : "");
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.from) {
      newErrors.from = "From Rep is required";
    }
    if (!formData.to) {
      newErrors.to = "To Rep is required";
    }
    if (formData.from && formData.to && formData.from === formData.to) {
      window.alert("Same Store Transfer Not allowed");
    }
    if (selectedProducts.length === 0) {
      newErrors.products = "At least one product is required";
      // toast.error("Please add at least one product");
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    const payload = {
      from: formData.from,
      to: formData.to,
      products: selectedProducts.map((product) => ({
        productId: product.id,
        resellerPrice: product.resellerPrice,
        quantity: product.quantity,
      })),
      totalAmount: formData.totalAmount,
      totalQuantity: formData.totalQuantity,
      flatDiscount: parseFloat(formData.flatDiscount) || 0,
      otherCharges: parseFloat(formData.otherCharges) || 0,
      netAmount: formData.netAmount,
    };

    try {
      const response = await storeService.createStockSale(payload);
      if (response.success) {
        toast.success("Stock sale created successfully");
        // Reset form
        setFormData({
          from: formData.from,
          to: "",
          product: "",
          store: "",
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
        setSelectedProducts([]);
      } else {
        toast.error(response.message || "Failed to create stock sale");
      }
    } catch (error) {
      console.error("Error creating stock sale:", error);
      toast.error("Error creating stock sale");
    }
  };

  const storeOptions = storeData.map((vendor) => {
    const option = {
      value: vendor._id,
      label: `${vendor.name}`,
    };
    return option;
  });

  const [hasSetDefaultStore, setHasSetDefaultStore] = useState(false);

  useEffect(() => {
    if (
      !hasSetDefaultStore &&
      storeOptions.length > 0 &&
      users?.stores?.length > 0
    ) {
      const defaultOption = storeOptions.find(opt => users.stores.includes(opt.value));
      if (defaultOption) {
        handleSelectChange(defaultOption, { name: "store" });
        setHasSetDefaultStore(true);
      }
    }
  }, [storeOptions, users?.stores, hasSetDefaultStore]);


  // Debounced product search for first AsyncSelect
  const loadProductOptions = async (inputValue) => {
    if (!inputValue || inputValue.length < 2) return [];
    try {
      const response = await storeService.searchProducts(inputValue);
      if (response.success) {
        const options = response.data.docs.map((product) => ({
          value: product._id,
          label: product.displayName,
          product,
        }));
        return options;
      }
      return [];
    } catch (error) {
      console.error("Error searching products:", error);
      return [];
    }
  };

  // Debounced product search for in-table AsyncSelect
  const loadProductOptionsExcludingLenses = async (inputValue) => {
    if (!inputValue || inputValue.length < 2) return [];
    try {
      const response = await storeService.searchProductsExcludingLenses(
        inputValue
      );
      if (response.success) {
        const options = response.data.docs.map((product) => ({
          value: product._id,
          label: product.displayName,
          product,
        }));
        return options;
      }
      return [];
    } catch (error) {
      console.error("Error searching products:", error);
      return [];
    }
  };

  const debouncedLoadOptions = useCallback(
    debounce((inputValue, callback) => {
      loadProductOptions(inputValue).then((options) => callback(options));
    }, 300),
    []
  );

  const debouncedLoadOptionsExcludingLenses = useCallback(
    debounce((inputValue, callback) => {
      loadProductOptionsExcludingLenses(inputValue).then((options) =>
        callback(options)
      );
    }, 300),
    []
  );

  const handleFirstProductSelect = async (option) => {
    if (!option) {
      setFormData((prev) => ({ ...prev, product: "" }));
      return;
    }
    const storeInfoId = localStorage.getItem("storeInfoId");

    const params = {
      "optimize[product]": option.value,
      "optimize[store]": formData.store,
      limit: 5,
      populate: true,
    };
    const inventoryResponse = await storeService.getInventoryGeneral(params);
    if (inventoryResponse?.data.totalDocs !== 0) {
      if (inventoryResponse.success && inventoryResponse.data.docs.length > 0) {
        setSelectedProducts((prev) => {
          const newProducts = [...prev];
          inventoryResponse.data.docs.forEach((inventory) => {
            if (newProducts.some((p) => p.id === inventory.product._id)) {
              return;
            }
            const productData = {
              id: inventory.product._id,
              barcode: inventory.product.newBarcode || "N/A",
              stock: inventory.quantity || 0,
              quantity: 1,
              sku: inventory.product.sku || "N/A",
              mrp: inventory.product.MRP || 0,
              resellerPrice: inventory.product.resellerPrice || 0,
              taxAmount: inventory.product.tax || 0,
              amount: 1 * (inventory.product.resellerPrice || 0),
            };
            newProducts.push(productData);
          });
          updateTotals(newProducts);
          return newProducts;
        });
      }
      setLoading(false);
      setFormData((prev) => ({ ...prev, product: option.value }));
    } else {
      window.alert("product out of stock");
    }
  };

  const handleSecondProductSelect = async (option) => {
    if (!option) {
      console.log("No option selected");
      return;
    }

    try {
      setLoading(true);
      const params = {
        "product._id": option.value,
        limit: 5,
        populate: true,
      };
      const inventoryResponse = await storeService.getInventoryGeneral(params);

      if (inventoryResponse.success && inventoryResponse.data.docs.length > 0) {
        setSelectedProducts((prev) => {
          const newProducts = [...prev];
          inventoryResponse.data.docs.forEach((inventory) => {
            if (newProducts.some((p) => p.id === inventory.product._id)) {
              return;
            }
            const productData = {
              id: inventory.product._id,
              barcode: inventory.product.newBarcode || "N/A",
              stock: inventory.quantity || 0,
              quantity: 1,
              sku: inventory.product.sku || "N/A",
              mrp: inventory.product.MRP || 0,
              resellerPrice: inventory.product.resellerPrice || 0,
              taxAmount: inventory.product.tax || 0,
              amount: 1 * (inventory.product.resellerPrice || 0),
            };
            newProducts.push(productData);
          });
          updateTotals(newProducts);
          return newProducts;
        });
      } else {
        toast.error("No inventory found for this product");
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);

      toast.error("Error fetching product inventory");
    }
  };

  const handleQuantityChange = (productId, value) => {
    const newQuantity = parseInt(value) >= 0 ? parseInt(value) : 0;
    setSelectedProducts((prev) => {
      const updatedProducts = prev.map((product) =>
        product.id === productId
          ? {
            ...product,
            quantity: newQuantity,
            amount: newQuantity * product.resellerPrice,
          }
          : product
      );
      updateTotals(updatedProducts);
      return updatedProducts;
    });
  };

  const handleResellerPriceChange = (productId, value) => {
    const newPrice = parseFloat(value) >= 0 ? parseFloat(value) : 0;
    setSelectedProducts((prev) => {
      const updatedProducts = prev.map((product) =>
        product.id === productId
          ? {
            ...product,
            resellerPrice: newPrice,
            amount: product.quantity * newPrice,
          }
          : product
      );
      updateTotals(updatedProducts);
      return updatedProducts;
    });
  };

  const handleRemoveProduct = (productId) => {
    setSelectedProducts((prev) => {
      const updatedProducts = prev.filter(
        (product) => product.id !== productId
      );
      updateTotals(updatedProducts);
      return updatedProducts;
    });
  };

  const updateTotals = (products) => {
    const totalQuantity = products.reduce((sum, p) => sum + p.quantity, 0);
    const totalAmount = products.reduce((sum, p) => sum + p.amount, 0);
    setFormData((prev) => ({
      ...prev,
      totalQuantity,
      totalAmount,
      netAmount:
        totalAmount -
        parseFloat(prev.flatDiscount || 0) +
        parseFloat(prev.otherCharges || 0),
    }));
  };

  return (
    <form className="container-fluid px-5" onSubmit={handleSubmit}>
      <div className="row d-flex align-items-stretch">
        {/* Left Column */}
        <div className="col-lg-9 col-md-6 col-12 p-0">
          <div className="border border-black p-4 bg-white d-flex flex-column gap-4">
            <div className="row g-4">
              <div className="col-md-4 col-12">
                <label htmlFor="from" className="custom-label font-weight-500">
                  From
                </label>
                <Select
                  id="from"
                  name="from"
                  options={storeOptions}
                  value={storeOptions.find(
                    (option) => users.stores.includes(option.value)
                  )}
                  onChange={(option) =>
                    handleSelectChange(option, { name: "from" })
                  }
                  isDisabled={true}
                  placeholder="Select..."
                  className={errors.from ? "is-invalid" : ""}
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderColor: errors.from ? "#dc3545" : base.borderColor,
                      "&:hover": {
                        borderColor: errors.from ? "#dc3545" : base.borderColor,
                      },
                    }),
                  }}
                />
                {errors.from && (
                  <div
                    className="invalid-feedback"
                    style={{ display: "block" }}
                  >
                    {errors.from}
                  </div>
                )}
              </div>
              <div className="col-md-4 col-12">
                <label htmlFor="to" className="custom-label font-weight-500">
                  To
                </label>
                <Select
                  id="to"
                  name="to"
                  options={storeOptions}
                  value={storeOptions.find(
                    (option) => option.value === formData.to
                  )}
                  onChange={(option) =>
                    handleSelectChange(option, { name: "to" })
                  }
                  isDisabled={false}
                  placeholder="Select..."
                  className={errors.to ? "is-invalid" : ""}
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderColor: errors.to ? "#dc3545" : base.borderColor,
                      "&:hover": {
                        borderColor: errors.to ? "#dc3545" : base.borderColor,
                      },
                    }),
                  }}
                />
                {errors.to && (
                  <div
                    className="invalid-feedback"
                    style={{ display: "block" }}
                  >
                    {errors.to}
                  </div>
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
                <AsyncSelect
                  cacheOptions
                  defaultOptions
                  loadOptions={debouncedLoadOptions}
                  onChange={handleFirstProductSelect}
                  placeholder="Search for a product..."
                  classNamePrefix="react-select"
                />
              </div>
            </div>
            {formData.product && selectedProducts.length < 2 && (
              <div className="d-flex gap-4 w-100">
                <div className="w-100">
                  <label
                    htmlFor="product"
                    className="custom-label font-weight-500"
                  >
                    Product
                  </label>
                  <AsyncSelect
                    cacheOptions
                    defaultOptions
                    loadOptions={debouncedLoadOptionsExcludingLenses}
                    onChange={handleSecondProductSelect}
                    placeholder="Search for another product..."
                    classNamePrefix="react-select "
                    styles={{
                      menu: (base) => ({
                        ...base,
                        zIndex: 1000,
                      }),
                      zIndex: "1000",
                    }}
                  />
                </div>
              </div>
            )}
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
                        padding: "0.75rem 0.5rem",
                      }}
                      className="custom-th"
                    >
                      Barcode
                    </th>
                    <th
                      style={{
                        minWidth: "160px",
                        padding: "0.75rem 0.5rem",
                      }}
                      className="custom-th"
                    >
                      Stock
                    </th>
                    <th
                      style={{ minWidth: "80px", padding: "0.75rem 0.5rem" }}
                      className="custom-th"
                    >
                      Qty
                    </th>
                    <th
                      style={{ minWidth: "20px", padding: "0.75rem 0.5rem" }}
                      className="custom-th"
                    >
                      SKU
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
                      Reseller Price
                    </th>
                    <th
                      style={{ minWidth: "80px", padding: "0.75rem 0.5rem" }}
                      className="custom-th"
                    >
                      Tax Amount
                    </th>
                    <th
                      style={{ minWidth: "20px", padding: "0.75rem 0.5rem" }}
                      className="custom-th"
                    >
                      Amount
                    </th>
                    <th
                      style={{ minWidth: "50px", padding: "0.75rem 0.5rem" }}
                      className="custom-th"
                    >
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody
                  style={{
                    fontSize: "0.875rem",
                    zIndex: 10,
                  }}
                >
                  {loading ? (
                    <tr>
                      <td colSpan="9" className="text-center">
                        Loading...
                      </td>
                    </tr>
                  ) : (
                    selectedProducts.length === 0 && (
                      <tr>
                        <td colSpan="9" className="text-center">
                          No products added
                        </td>
                      </tr>
                    )
                  )}
                  {selectedProducts.map((product, index) => (
                    <tr key={`${product.id}-${index}`}>
                      <td>{product.barcode}</td>
                      <td>{product.stock}</td>
                      <td>
                        <input
                          type="number"
                          className="form-control"
                          value={product.quantity}
                          onChange={(e) =>
                            handleQuantityChange(product.id, e.target.value)
                          }
                          min="0"
                          style={{ width: "80px" }}
                        />
                      </td>
                      <td>{product.sku}</td>
                      <td>{product.mrp}</td>
                      <td>
                        <input
                          type="number"
                          className="form-control"
                          value={product.resellerPrice}
                          onChange={(e) =>
                            handleResellerPriceChange(
                              product.id,
                              e.target.value
                            )
                          }
                          min="0"
                          step="0.01"
                          style={{ width: "100px" }}
                        />
                      </td>
                      <td>{product.taxAmount}</td>
                      <td>{product.amount}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => handleRemoveProduct(product.id)}
                          title="Remove"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column - Summary */}
        <div className="col-lg-3 col-md-6 col-12 p-0">
          <div className="border h-100 border-black p-4 bg-white">
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
                    className={`form-control w-100 ${field.readOnly ? "custom-disabled" : ""
                      }`}
                    id={field.name}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={(e) =>
                      handleInputChange(e.target.name, e.target.value)
                    }
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

        <div className="col-12 mt-3 p-0">
          <button type="submit" className="btn btn-primary">
            Submit
          </button>
        </div>
      </div>
    </form>
  );
};

export default StockSaleForm;
