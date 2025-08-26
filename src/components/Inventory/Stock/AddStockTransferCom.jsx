import React, { useState, useMemo, useCallback, useEffect } from "react";
import Select from "react-select";
import "bootstrap/dist/css/bootstrap.min.css";
import { debounce } from "lodash";
import { inventoryService } from "../../../services/inventoryService";
import { toast } from "react-toastify"; // Assuming toast is imported for error handling

const AddStockTransferCom = () => {
  // State for form fields
  const [from, setFrom] = useState(null); // Initialize as null, will set default later
  const [to, setTo] = useState(null);
  const [product, setProduct] = useState(null);
  const [items, setItems] = useState([]);
  const [productData, setProductData] = useState([]);
  const [storeData, setStoreData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showData, setShowData] = useState([]);

  // Retrieve user data from localStorage
  const user = JSON.parse(localStorage.getItem("user")) || {};

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ from, to, product, tableData: showData });
    // Add API call or further logic here
  };

  const handleProductChange = (selectedOption) => {
    setItems(selectedOption);
  };

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
      console.error("Error fetching products:", error);
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

        // Set default 'from' based on user's store ID
        if (user.stores && user.stores.length > 0) {
          const userStoreId = user.stores[0]; // Use first store ID
          const defaultStore = stores.find(
            (store) => store._id === userStoreId
          );
          if (defaultStore) {
            setFrom({
              value: defaultStore._id,
              label: `${defaultStore.name}${
                defaultStore.storeNumber ? ` / ${defaultStore.storeNumber}` : ""
              }`,
            });
          } else {
            // Fallback to hardcoded default if no matching store is found
            setFrom({
              value: "27",
              label: "ELITE HOSPITAL / 27",
            });
          }
        } else {
          // Fallback to hardcoded default if no stores in user data
          setFrom({
            value: "27",
            label: "ELITE HOSPITAL / 27",
          });
        }
      } else {
        toast.error(response.message);
        // Set fallback default if API fails
        setFrom({
          value: "27",
          label: "ELITE HOSPITAL / 27",
        });
      }
    } catch (error) {
      console.error("Error fetching stores:", error);
      toast.error("Failed to load stores");
      // Set fallback default on error
      setFrom({
        value: "27",
        label: "ELITE HOSPITAL / 27",
      });
    } finally {
      setLoading(false);
    }
  };

  const storeOptions = storeData?.map((vendor) => ({
    value: vendor._id,
    label: `${vendor.name}${
      vendor.storeNumber ? ` / ${vendor.storeNumber}` : ""
    }`,
  }));

  const productOptions = productData?.docs?.map((vendor) => ({
    value: vendor._id,
    label: `${vendor.oldBarcode} ${vendor.sku}`,
  }));

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
                <div>
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
              </div>
              <div className="col-12">
                <div>
                  <label htmlFor="to" className="form-label font-weight-500">
                    To
                  </label>
                  <Select
                    id="to"
                    value={to}
                    onChange={setTo}
                    options={storeOptions}
                    placeholder="Select..."
                    className="w-100"
                    isLoading={loading}
                  />
                </div>
              </div>
              <div className="col-12">
                <div>
                  <label
                    htmlFor="product"
                    className="form-label font-weight-500"
                  >
                    Product
                  </label>
                  <Select
                    options={productOptions}
                    value={items}
                    onChange={(option) => handleProductChange(option)}
                    placeholder="Select..."
                    className="basic-select"
                    classNamePrefix="select"
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
                <div className="table-responsive mt-3">
                  <table className="table table-sm">
                    <thead className="text-xs text-uppercase text-muted bg-light border">
                      <tr>
                        <th className="custom-perchase-th">barcode</th>
                        <th className="custom-perchase-th">stock</th>
                        <th className="custom-perchase-th">quantity</th>
                        <th className="custom-perchase-th">sku</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {showData?.docs?.length > 0 ? (
                        showData.docs.map((item, index) => (
                          <tr key={item.id || index}>
                            <td>{index + 1}</td>
                            <td>
                              {moment(item.createdAt).format("YYYY-MM-DD")}
                            </td>
                            <td>
                              {item.from.storeNumber}/{item.from.name}
                            </td>
                            <td>
                              {item.to.storeNumber}/{item.to.name}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="8"
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
                <button type="submit" className="btn custom-button-bgcolor">
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

export default AddStockTransferCom;
