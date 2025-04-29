import React, { useState, useCallback, useEffect } from "react";
import Select from "react-select";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import "bootstrap/dist/css/bootstrap.min.css";
import debounce from "lodash/debounce";
import { inventoryService } from "../../../services/inventoryService";
import { toast } from "react-toastify";

const StockAdjustmentCom = () => {
  const [to, setTo] = useState(null);

  const [product, setProduct] = useState(null);

  const [productData, setProductData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [storeData, setStoreData] = useState([]);
  const [inventory, setInventory] = useState([]);
  console.log("inventory", inventory);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ from, to, product, tableData });
    // Add API call or further logic here
  };

  useEffect(() => {
    getStores();
  }, []);

  const getProduct = async (search) => {
    setLoading(true);

    try {
      const response = await inventoryService.universalSearch(search);
      if (response.success) {
        setProductData(response?.data?.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error(" error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStores = async () => {
    setLoading(true);
    try {
      const response = await inventoryService.getStores();
      if (response.success) {
        setStoreData(response?.data?.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error(" error:", error);
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
    [] // empty dependency to persist across re-renders
  );

  const productOptions = productData?.docs?.map((vendor) => ({
    value: vendor._id,
    label: `${vendor.oldBarcode} ${vendor.sku}`,
  }));

  const storeOptions = storeData?.map((vendor) => ({
    value: vendor._id,
    label: `${vendor.name}`,
  }));

  useEffect(() => {
    if (to || product) {
      getInventoryData();
    }
  }, [to, product]);

  const getInventoryData = async () => {
    setLoading(true);

    try {
      const response = await inventoryService.getStockAdjustment(
        product?.value,
        to?.value
      );
      if (response.success) {
        setInventory(response?.data?.data?.docs);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("error:", error);
    } finally {
      setLoading(false);
    }
  };

  const reasonOptions = [
    { value: "Damaged", label: "Damaged" },
    { value: "Lost", label: "Lost" },
    { value: "Returned", label: "Returned" },
  ];

  useEffect(() => {
    if (inventory?.length > 0) {
      const updatedProducts = inventory.map((item) => ({
        ...item,
        quantityToUpdate: 0,
        reason: null,
      }));
      setProducts(updatedProducts);
    } else {
      setProducts([]);
    }
  }, [inventory]);

  const [products, setProducts] = useState(
    inventory?.docs?.map((item) => ({
      ...item,
      quantityToUpdate: 0,
      reason: null,
    }))
  );

  console.log("products", products);

  const handleQuantityChange = (index, value) => {
    const updatedProducts = [...products];
    updatedProducts[index].quantityToUpdate = parseInt(value, 10) || 0;
    setProducts(updatedProducts);
  };

  const handleReasonChange = (index, selectedOption) => {
    const updatedProducts = [...products];
    updatedProducts[index].reason = selectedOption;
    setProducts(updatedProducts);
  };

  const handleRemoveProduct = (index) => {
    setProducts((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="container-fluid px-md-5 px-2 py-5">
      <h1 className="h2 text-dark fw-bold mb-4 px-md-5 px-2">
        Stock Adjustment
      </h1>
      <div className=" px-md-5">
        <div className="card-body ">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-12 ">
                <div className="">
                  <label htmlFor="to" className="form-label font-weight-500">
                    Select Store
                  </label>
                  <Select
                    id="Select Store"
                    value={to}
                    onChange={setTo}
                    options={storeOptions}
                    placeholder="Select..."
                    className="w-100"
                  />
                </div>
              </div>
              <div className="col-12">
                <div className="">
                  <label
                    htmlFor="product"
                    className="form-label font-weight-500"
                  >
                    Product
                  </label>
                  <Select
                    id="product"
                    value={product}
                    onChange={setProduct}
                    options={productOptions}
                    placeholder="Select..."
                    className="w-100"
                    onInputChange={(value) => {
                      debouncedGetProduct(value);
                    }}
                    isLoading={loading}
                    loadingMessage={() => "Loading..."}
                    noOptionsMessage={({ inputValue }) =>
                      inputValue ? "No products found" : "Type to search"
                    }
                  />
                </div>
              </div>
              <div className="col-12">
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead className="text-xs text-uppercase text-muted bg-light border">
                      <tr>
                        <th>barcode</th>
                        <th>Stock</th>
                        <th>quantity</th>
                        <th>reason</th>
                        <th>sku</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {products?.length > 0 ? (
                        products.map((item, index) => (
                          <tr key={item.product?._id || index}>
                            <td className="">
                              {item.product?.oldBarcode || "-"}
                            </td>
                            <td className="">{item.quantity}</td>
                            <td className="">
                              <input
                                type="number"
                                value={item.quantityToUpdate}
                                onChange={(e) =>
                                  setProducts((prev) =>
                                    prev.map((p, i) =>
                                      i === index
                                        ? {
                                            ...p,
                                            quantityToUpdate:
                                              parseInt(e.target.value) || 0,
                                          }
                                        : p
                                    )
                                  )
                                }
                                className="form-control"
                              />
                            </td>
                            <td className="">
                              <Select
                                options={reasonOptions}
                                value={item.reason}
                                onChange={(selected) =>
                                  setProducts((prev) =>
                                    prev.map((p, i) =>
                                      i === index
                                        ? { ...p, reason: selected }
                                        : p
                                    )
                                  )
                                }
                                placeholder="Select..."
                                className="w-100"
                              />
                            </td>
                            <td className="">{item.product?.sku || "-"}</td>
                            <td className=" align-middle text-center">
                              <button
                                type="button"
                                className="btn btn-sm btn-danger"
                                onClick={() => handleRemoveProduct(index)}
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="6"
                            className="text-center p-4 text-gray-500"
                          >
                            No Data Found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="d-flex px-3 pb-3 flex-column flex-sm-row justify-content-between align-items-center mt-3">
                  <div className="text-sm text-muted mb-3 mb-sm-0">
                    Showing <span className="fw-medium">1</span> to{" "}
                    <span className="fw-medium">{inventory?.docs?.length}</span>{" "}
                    of{" "}
                    <span className="fw-medium">{inventory?.docs?.length}</span>{" "}
                    results
                  </div>
                  <div className="btn-group">
                    <button className="btn btn-outline-primary">
                      Previous
                    </button>
                    <button className="btn btn-outline-primary">Next</button>
                  </div>
                </div>
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
  );
};

export default StockAdjustmentCom;
