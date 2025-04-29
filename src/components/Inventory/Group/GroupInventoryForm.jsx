import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import { toast } from "react-toastify";
import { inventoryService } from "../../../services/inventoryService";
import { FaSearch } from "react-icons/fa";

const GroupInventoryForm = () => {
  // Options for select fields
  const [storeData, setStoreData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoryData, setCategoryData] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const user = JSON.parse(localStorage.getItem("user"));

  const storeOptions = storeData?.map((vendor) => ({
    value: vendor._id,
    label: `${vendor.name}`,
  }));

  const brandOptions = categoryData?.map((vendor) => ({
    value: vendor._id,
    label: `${vendor.name}`,
  }));

  // Formik setup with Yup validation
  const formik = useFormik({
    initialValues: {
      stores: [],
      brand: [],
    },
    validationSchema: Yup.object({
      stores: Yup.array().notRequired(),

      brand: Yup.array().notRequired(),
    }),
    onSubmit: (values) => {
      console.log("Form submitted:", values);
      getInventoryData(values);
    },
  });

  const exportProduct = async (e) => {
    e.preventDefault();

    const finalData = [];

    inventory?.docs?.forEach((item) => {
      const selected = item.product;
      console.log("item", item);
      const quantity = parseInt(item.quantity) || 0;

      // for (let i = 0; i < quantity; i++) {
      finalData.push({
        sku: selected.sku,
        Barcode: selected.oldBarcode,
        stock: item.quantity,
        sold: item?.sold,
        mrp: selected?.MRP,
        brand: selected?.brandData?.name,
        "Frame Type": selected?.frameType?.name,
        "Frame Shape": selected?.frameShape?.name,
        gender: selected?.gender,
        "Frame Material": selected?.frameMaterial?.name,
        "Frame Color": selected?.frameColor?.name,
        "Frame Size": selected?.frameSize,
      });
      // }
    });

    const finalPayload = {
      data: finalData, // Wrap your array like this
    };

    setLoading(true);

    try {
      const response = await inventoryService.exportCsv(finalPayload);

      if (response.success) {
        const csvData = response.data; // string: e.g., "sku,barcode,price\n7STAR-9005-46,10027,1350"

        // Create a Blob from the CSV string
        const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        // Create a temporary download link
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "barcodes.csv"); // Set the desired filename
        document.body.appendChild(link);
        link.click(); // Trigger the download
        document.body.removeChild(link); // Clean up
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getStores();
    getBrandData();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      getInventoryData();
    }, 500); // 500ms delay

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const getInventoryData = async (values) => {
    const storeId = values?.stores?.map((option) => option.value);

    const brandId = values?.brand?.map((option) => option.value);

    setLoading(true);

    try {
      const response = await inventoryService.getGroupStore(
        brandId,
        storeId || user?.stores,
        1,
        searchQuery,
        20
      );
      if (response.success) {
        console.log("response", response);
        setInventory(response?.data?.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("error:", error);
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

  const getBrandData = async () => {
    setLoading(true);
    try {
      const response = await inventoryService.getBrand();
      if (response.success) {
        setCategoryData(response?.data?.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error(" error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-body px-3 py-1">
      <form onSubmit={formik.handleSubmit}>
        <div className="row row-cols-1  g-3">
          <div className="col">
            <label className="form-label font-weight-500" htmlFor="stores">
              Select Store
            </label>
            <Select
              options={storeOptions}
              value={formik.values.stores}
              isMulti
              onChange={(option) => formik.setFieldValue("stores", option)}
              onBlur={() => formik.setFieldTouched("stores", true)}
              placeholder="Select..."
              classNamePrefix="react-select"
              className={
                formik.touched.stores && formik.errors.stores
                  ? "is-invalid"
                  : ""
              }
            />
            {formik.touched.stores && formik.errors.stores && (
              <div className="text-danger mt-1">{formik.errors.stores}</div>
            )}
          </div>

          <div className="col">
            <label className="form-label font-weight-500" htmlFor="brand">
              Brand
            </label>
            <Select
              options={brandOptions}
              isMulti
              value={formik.values.brand}
              onChange={(option) => formik.setFieldValue("brand", option)}
              onBlur={() => formik.setFieldTouched("brand", true)}
              placeholder="Select..."
              classNamePrefix="react-select"
              className={
                formik.touched.brand && formik.errors.brand ? "is-invalid" : ""
              }
            />
            {formik.touched.brand && formik.errors.brand && (
              <div className="text-danger mt-1">{formik.errors.brand}</div>
            )}
          </div>
        </div>
        <div className="mt-4">
          <button
            type="submit"
            className="btn custom-button-bgcolor"
            // disabled={formik.isSubmitting}
          >
            Submit
          </button>
        </div>
      </form>

      <div className="card p-0 shadow-none border mt-5">
        <h6 className="fw-bold px-3 pt-3">Inventory</h6>
        <div className="card-body p-0">
          <div className="d-flex flex-column px-3  flex-md-row gap-3 mb-4">
            <p className="mb-0 fw-normal text-black">
              Total Quantity: {inventory?.countResult?.[0]?.totalQuantity}
            </p>
            <p className="mb-0 fw-normal text-black">
              Total Sold: {inventory?.countResult?.[0]?.totalQuantity}
            </p>

            <button
              className="btn custom-button-bgcolor ms-md-auto"
              onClick={(e) => exportProduct(e)}
            >
              Export Product
            </button>
          </div>
          <div className="mb-4  col-md-5">
            <div className="input-group px-2">
              <span className="input-group-text bg-white border-end-0">
                <FaSearch
                  className="text-muted custom-search-icon"
                  style={{ color: "#94a3b8" }}
                />
              </span>
              <input
                type="search"
                className="form-control border-start-0 py-2"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="table-responsive px-2">
            <table className="table table-sm">
              <thead className="text-xs text-uppercase text-muted bg-light border">
                <tr>
                  <th className="custom-perchase-th">Barcode</th>

                  <th className="custom-perchase-th">Model</th>

                  <th className="custom-perchase-th">Stock</th>
                  <th className="custom-perchase-th">Sold</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {inventory?.docs?.length > 0 ? (
                  inventory.docs.map((item, index) => (
                    <tr key={item.id || index}>
                      <td>icon</td>
                      <td>
                        <img
                          src={item.photo}
                          alt="Product"
                          width="40"
                          height="40"
                        />
                      </td>

                      <td>{item.quantity}</td>
                      <td>{item.sold}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="text-center custom-perchase-th py-3"
                    >
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="d-flex px-3 pb-3 flex-column flex-sm-row justify-content-between align-items-center mt-3">
            <div className="text-sm text-muted mb-3 mb-sm-0">
              Showing <span className="fw-medium">1</span> to{" "}
              <span className="fw-medium">{inventory?.docs?.length}</span> of{" "}
              <span className="fw-medium">{inventory?.docs?.length}</span>{" "}
              results
            </div>
            <div className="btn-group">
              <button className="btn btn-outline-primary">Previous</button>
              <button className="btn btn-outline-primary">Next</button>
            </div>
          </div>
        </div>
        {/* <ImageSliderModal
        show={showModal}
        onHide={closeImageModal}
        images={modalImages}
      /> */}
        {/* <InventoryTable data={inventory} /> */}
      </div>
    </div>
  );
};

export default GroupInventoryForm;
