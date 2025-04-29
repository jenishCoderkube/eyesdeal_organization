import React, { useState, useMemo, useCallback, useEffect } from "react";
import Select from "react-select";

import "bootstrap/dist/css/bootstrap.min.css";
import { debounce } from "lodash";
import { inventoryService } from "../../../services/inventoryService";

const AddStockTransferCom = () => {
  // State for form fields
  const [from, setFrom] = useState({
    value: "27",
    label: "ELITE HOSPITAL / 27",
  });
  const [to, setTo] = useState(null);
  const [product, setProduct] = useState(null);
  const [items, setItems] = useState([]);
  const [productData, setProductData] = useState([]);

  const [storeData, setStoreData] = useState([]);

  const [loading, setLoading] = useState(false);
  const [showData, setShowData] = useState([]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ from, to, product, tableData });
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
      console.error("error:", error);
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

  useEffect(() => {
    getStores();
  }, []);

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

  const storeOptions = storeData?.map((vendor) => ({
    value: vendor._id,
    label: `${vendor.name}`,
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
      <div className=" px-md-5">
        <div className="card-body ">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-12 ">
                <div className="">
                  <label htmlFor="from" className="form-label font-weight-500">
                    From
                  </label>
                  <Select
                    id="from"
                    value={from}
                    onChange={setFrom}
                    options={[{ value: "27", label: "ELITE HOSPITAL / 27" }]}
                    isDisabled={true}
                    className="w-100"
                  />
                </div>
              </div>
              <div className="col-12 ">
                <div className="">
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
                    options={productOptions}
                    value={items}
                    onChange={(option) => handleProductChange(option)}
                    placeholder="Select..."
                    className="basic-select"
                    classNamePrefix="select"
                    onInputChange={(value) => {
                      debouncedGetProduct(value);
                    }}
                    isLoading={loading} // ✅ shows spinner while loading
                    loadingMessage={() => "Loading..."} // ✅ custom loading message
                    noOptionsMessage={({ inputValue }) =>
                      inputValue ? "No products found" : "Type to search"
                    }
                  />
                </div>
              </div>
              <div className="col-12 ">
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
