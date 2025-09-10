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
import { useFormik } from "formik";

const StockAdjustmentCom = () => {
  const [to, setTo] = useState(null);
  const [storeData, setStoreData] = useState([]);

  const [product, setProduct] = useState(null);

  const [productData, setProductData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inventory, setInventory] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));
  console.log("storeData", storeData);

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

  useEffect(() => {
    const storedStoreId = user?.stores?.[0];
    if (storedStoreId && storeData.length > 0) {
      const defaultStore = storeData.find(
        (store) => store._id === storedStoreId
      );
      if (defaultStore) {
        formik.setFieldValue("stores", [
          {
            value: defaultStore._id,
            label: defaultStore.name,
          },
        ]);
      }
    }
  }, [storeData]);

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

  console.log("productOptions", product);

  const storeOptions = storeData?.map((vendor) => ({
    value: vendor._id,
    label: `${vendor.name}`,
  }));

  useEffect(() => {
    if (product) {
      getInventoryData();
    }
  }, [product]);

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
    { value: "Product Damage ", label: "Product Damage " },
    { value: "Product Defective ", label: "Product Defective " },
    { value: "Product Theft/Loss", label: "Product Theft/Loss" },
    { value: "Product Less then Actual", label: "Product Less then Actual" },
    { value: "Product More then Actual", label: "Product More then Actual" },
  ];

  useEffect(() => {
    if (inventory?.length > 0) {
      const updatedProducts = inventory.map((item) => ({
        ...item,
        quantityToUpdate: item?.quantity,
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
    updatedProducts[index].quantityToUpdate = parseInt(value, 10);
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
  function generateAdjustmentId() {
    const getRandomDigit = () => Math.floor(Math.random() * 10).toString();
    const getRandomLetter = () =>
      String.fromCharCode(65 + Math.floor(Math.random() * 26));

    return [
      getRandomDigit(),
      getRandomDigit(), // First two digits
      getRandomLetter(),
      getRandomLetter(), // Next two letters
      getRandomDigit(),
      getRandomDigit(), // Next two digits
      getRandomLetter(),
      getRandomLetter(), // Final two letters
    ].join("");
  }
  const formik = useFormik({
    initialValues: {
      stores: [],
      brand: [],
    },
  });
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!products[0].reason) {
      toast("please select Reason");
      return;
    }
    const data = {
      store: formik.values.stores[0]?.value, // formik.values instead of values
      product: product?.value,
      newQuantity: products[0]?.quantityToUpdate,
      adjustmentId: generateAdjustmentId(),
      stock: products[0].quantity,
      reason: products[0].reason?.label,
    };
    console.log("data", data);

    setLoading(true);

    try {
      const response = await inventoryService.addStockUpdate(data);
      if (response.success) {
        toast.success(response.data?.message);
        setTo(null);
        setStoreData([]);
        setInventory([]);
        setProductData([]);
        setProducts([]);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("error:", error);
    } finally {
      setLoading(false);
    }
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
                    id="stores"
                    value={formik.values.stores}
                    onChange={(option) =>
                      formik.setFieldValue("stores", option)
                    }
                    onBlur={() => formik.setFieldTouched("stores", true)}
                    options={storeOptions}
                    placeholder="Select..."
                    className={`w-100 ${
                      formik.touched.stores && formik.errors.stores
                        ? "is-invalid"
                        : ""
                    }`}
                    isMulti
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
                        <th className="custom-perchase-th">barcode</th>

                        <th className="custom-perchase-th">quantity</th>
                        <th className="custom-perchase-th">reason</th>
                        <th className="custom-perchase-th">sku</th>
                        <th className="custom-perchase-th">Action</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {products?.length > 0 ? (
                        products.map((item, index) => (
                          <tr key={item.product?._id || index}>
                            <td className="">
                              {item.product?.oldBarcode || "-"}
                            </td>

                            <td className="">
                              <input
                                type="number"
                                value={item.quantityToUpdate}
                                onChange={(e) =>
                                  handleQuantityChange(index, e.target.value)
                                }
                                className="form-control"
                              />
                            </td>
                            <td style={{ position: "relative", zIndex: 1000 }}>
                              <Select
                                options={reasonOptions}
                                value={item.reason}
                                onChange={(selected) =>
                                  handleReasonChange(index, selected)
                                }
                                placeholder="Select..."
                                className="w-100"
                                styles={{
                                  menu: (provided) => ({
                                    ...provided,
                                    zIndex: 9999, // Higher z-index for the dropdown menu
                                  }),
                                  menuPortal: (provided) => ({
                                    ...provided,
                                    zIndex: 9999, // Ensure portal rendering uses high z-index
                                  }),
                                }}
                                menuPortalTarget={document.body} // Render dropdown in body to avoid clipping
                                menuPosition="fixed" // Use fixed positioning to avoid stacking issues
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
                            className="text-center add_power_title p-4 text-gray-500"
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
                    Showing{" "}
                    <span className="fw-medium">{products?.length}</span> to{" "}
                    <span className="fw-medium">{products?.length}</span> of{" "}
                    <span className="fw-medium">{products?.length}</span>{" "}
                    results
                  </div>
                  <div className="btn-group">
                    <button type="button" className="btn btn-outline-primary">
                      Previous
                    </button>
                    <button type="button" className="btn btn-outline-primary">
                      Next
                    </button>
                  </div>
                </div>
              </div>
              <div className="col-12">
                <button type="submit" className="btn custom-button-bgcolor ">
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
