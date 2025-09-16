import React, { useState, useCallback, useEffect } from "react";
import Select from "react-select";
import "bootstrap/dist/css/bootstrap.min.css";
import { debounce } from "lodash";
import { inventoryService } from "../../../services/inventoryService";
import { toast } from "react-toastify";

const AddStockTransferCom = () => {
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [products, setProducts] = useState([]); // Array of { productId, stockQuantity, label, availableStock }
  const [productData, setProductData] = useState([]);
  const [storeData, setStoreData] = useState([]);
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user")) || {};

  // Handle quantity change for a specific product
  const handleQuantityChange = (productId, value) => {
    setProducts((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, stockQuantity: value } : item
      )
    );
  };

  const handleQuantityBlur = (productId, value, availableStock) => {
    const numeric = parseInt(value, 10);
    const clamped = Math.min(
      Math.max(isNaN(numeric) ? 1 : numeric, 1),
      availableStock
    );
    setProducts((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, stockQuantity: clamped }
          : item
      )
    );
  };

  // Handle product selection
  const handleProductChange = async (selectedOption) => {
    if (!from) {
      toast.error("Please select a 'From' store first");
      return;
    }

    if (!selectedOption) return;

    setLoading(true);
    try {
      const response = await inventoryService.getInventoryByStoreAndProduct(
        from.value,
        selectedOption.value
      );
      const inventoryItem = response?.data?.data?.docs?.[0];

      if (response.success && inventoryItem && inventoryItem.quantity > 0) {
        setProducts((prev) => {
          const existingProductIndex = prev.findIndex(
            (p) => p.productId === selectedOption.value
          );

          if (existingProductIndex !== -1) {
            // If product exists, increase quantity by 1 (up to available stock) and move to top
            const updatedProducts = [...prev];
            const existingProduct = updatedProducts[existingProductIndex];
            updatedProducts.splice(existingProductIndex, 1); // Remove from current position
            return [
              {
                ...existingProduct,
                stockQuantity: Math.min(
                  Number(existingProduct.stockQuantity) + 1,
                  existingProduct.availableStock
                ),
              },
              ...updatedProducts,
            ];
          } else {
            // Add new product at the start of the array (for top display)
            return [
              {
                productId: selectedOption.value,
                stockQuantity: 1,
                label: selectedOption.label,
                availableStock: inventoryItem.quantity,
              },
              ...prev,
            ];
          }
        });
      } else {
        toast.error(
          `${selectedOption.label} is out of stock in the selected store`
        );
      }
    } catch (error) {
      console.error("Error checking inventory:", error);
      toast.error(`Failed to check stock for ${selectedOption.label}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle removing a product via table button
  const handleRemoveProduct = (productId) => {
    setProducts((prev) => prev.filter((item) => item.productId !== productId));
  };

  // Handle to store change with same store validation
  const handleToChange = (selectedOption) => {
    if (selectedOption && from && selectedOption.value === from.value) {
      toast.error("Cannot transfer to the same store");
      return;
    }
    setTo(selectedOption);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!from || !to || products.length === 0) {
      toast.error("Please fill all required fields");
      return;
    }

    // Validate quantities against available stock
    for (const product of products) {
      const qty = Math.min(
        Math.max(Number(product.stockQuantity) || 1, 1),
        product.availableStock
      );
      if (qty > product.availableStock) {
        toast.error(
          `Requested quantity for ${product.label} exceeds available stock (${product.availableStock})`
        );
        return;
      }
    }

    const payload = {
      from: from.value,
      to: to.value,
      products: products.map(({ productId, stockQuantity, availableStock }) => {
        const qty = Math.min(
          Math.max(Number(stockQuantity) || 1, 1),
          availableStock
        );
        return {
          productId,
          stockQuantity: qty,
        };
      }),
    };

    setLoading(true);
    try {
      const response = await inventoryService.createStockTransfer(payload);
      if (response.success) {
        toast.success("Stock transfer successfully");
        setTo(null);
        setProducts([]);
      } else {
        toast.error(response.message || "Failed to create stock transfer");
      }
    } catch (error) {
      console.error("Error creating stock transfer:", error);
      toast.error("Failed to create stock transfer");
    } finally {
      setLoading(false);
    }
  };

  const getProduct = async (search) => {
    setLoading(true);
    try {
      const response = await inventoryService.universalSearch(search);
      if (response.success) {
        setProductData(response?.data?.data || []);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const debouncedGetProduct = useCallback(
    debounce((value) => {
      if (value?.trim()) {
        getProduct(value);
      }
    }, 1000),
    []
  );

  useEffect(() => {
    getStores();
  }, []);

  const getStores = async () => {
    setLoading(true);
    try {
      const response = await inventoryService.getStores();
      if (response.success) {
        const stores = response?.data?.data || [];
        setStoreData(stores);

        if (user.stores && user.stores.length > 0) {
          const userStoreId = user.stores[0];
          const defaultStore = stores.find(
            (store) => store._id === userStoreId
          );
          setFrom(
            defaultStore
              ? {
                  value: defaultStore._id,
                  label: `${defaultStore.name}${
                    defaultStore.storeNumber
                      ? ` / ${defaultStore.storeNumber}`
                      : ""
                  }`,
                }
              : { value: "27", label: "ELITE HOSPITAL / 27" }
          );
        } else {
          setFrom({ value: "27", label: "ELITE HOSPITAL / 27" });
        }
      } else {
        toast.error(response.message);
        setFrom({ value: "27", label: "ELITE HOSPITAL / 27" });
      }
    } catch (error) {
      console.error("Error fetching stores:", error);
      toast.error("Failed to load stores");
      setFrom({ value: "27", label: "ELITE HOSPITAL / 27" });
    } finally {
      setLoading(false);
    }
  };

  const storeOptions =
    storeData?.map((vendor) => ({
      value: vendor._id,
      label: `${vendor.name}${
        vendor.storeNumber ? ` / ${vendor.storeNumber}` : ""
      }`,
    })) || [];

  // Filter out already selected products from options
  const productOptions =
    productData?.docs
      ?.filter((vendor) => !products.some((p) => p.productId === vendor._id))
      .map((vendor) => ({
        value: vendor._id,
        label: `${vendor.oldBarcode} ${vendor.sku}`,
      })) || [];

  return (
    <div className="container-fluid px-md-5 px-2 py-5">
      <h1 className="h2 text-dark fw-bold mb-4 px-md-5 px-2">
        Add Stock Transfer
      </h1>
      <div className="px-md-5">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-12">
                <label htmlFor="from" className="form-label font-weight-500">
                  From
                </label>
                <Select
                  id="from"
                  value={from}
                  onChange={setFrom}
                  options={storeOptions}
                  isDisabled={true}
                  className="w-100"
                  isLoading={loading}
                  placeholder="Select..."
                />
              </div>
              <div className="col-12">
                <label htmlFor="to" className="form-label font-weight-500">
                  To
                </label>
                <Select
                  id="to"
                  value={to}
                  onChange={handleToChange}
                  options={storeOptions}
                  placeholder="Select..."
                  className="w-100"
                  isLoading={loading}
                />
              </div>
              <div className="col-12">
                <label htmlFor="product" className="form-label font-weight-500">
                  Products
                </label>
                <Select
                  options={productOptions}
                  value={null} // Clear selection after each pick
                  onChange={handleProductChange}
                  placeholder="Select products..."
                  className="basic-select"
                  classNamePrefix="select"
                  onInputChange={debouncedGetProduct}
                  isLoading={loading}
                  loadingMessage={() => "Loading..."}
                  noOptionsMessage={({ inputValue }) =>
                    inputValue ? "No products found" : "Type to search"
                  }
                />
              </div>
              <div className="col-12">
                <div className="table-responsive mt-3">
                  <table className="table table-sm">
                    <thead className="text-xs text-uppercase text-muted bg-light border">
                      <tr>
                        <th className="custom-perchase-th">Barcode</th>
                        <th className="custom-perchase-th">SKU</th>
                        <th className="custom-perchase-th">Quantity</th>
                        <th className="custom-perchase-th">Stock</th>
                        <th className="custom-perchase-th">Action</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {products.length > 0 ? (
                        products.map((item, index) => (
                          <tr key={item.productId || index}>
                            <td>{item.label.split(" ")[0]}</td> {/* Barcode */}
                            <td>{item.label.split(" ")[1]}</td> {/* SKU */}
                            <td>
                              <input
                                type="number"
                                value={item.stockQuantity}
                                onChange={(e) =>
                                  handleQuantityChange(
                                    item.productId,
                                    e.target.value
                                  )
                                }
                                onBlur={(e) =>
                                  handleQuantityBlur(
                                    item.productId,
                                    e.target.value,
                                    item.availableStock
                                  )
                                }
                                className="form-control form-control-sm w-75"
                              />
                            </td>
                            <td>{item.availableStock}</td>
                            <td>
                              <button
                                type="button"
                                className="btn btn-danger btn-sm"
                                onClick={() =>
                                  handleRemoveProduct(item.productId)
                                }
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="5"
                            className="text-center add_power_title py-3"
                          >
                            No data available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="col-12">
                <button
                  type="submit"
                  className="btn custom-button-bgcolor"
                  disabled={loading || !from || !to || products.length === 0}
                >
                  {loading ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddStockTransferCom;
