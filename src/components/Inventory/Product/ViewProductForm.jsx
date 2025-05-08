import React, { useCallback, useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import { FaSearch } from "react-icons/fa";
import { inventoryService } from "../../../services/inventoryService";
import { toast } from "react-toastify";
import debounce from "lodash/debounce";
import moment from "moment";

const ViewProductForm = () => {
  const [inventory, setInventory] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [productData, setProductData] = useState([]);
  const [loading, setLoading] = useState(false);

  const productOptions = productData?.docs?.map((vendor) => ({
    value: vendor._id,
    label: `${vendor.oldBarcode} ${vendor.sku}`,
  }));

  const formik = useFormik({
    initialValues: { product: [] },
    validationSchema: Yup.object({
      product: Yup.array().notRequired(),
    }),
    onSubmit: (values) => {
      console.log("Form submitted:", values);
      getInventoryData(values);
    },
  });

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

  const getInventoryData = async (values) => {
    const productIds = values?.product?.map((option) => option.value);
    setLoading(true);
    try {
      const response = await inventoryService.getProductStore(
        productIds,
        1,
        20,
        true
      );
      if (response.success) {
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

  const debouncedGetProduct = useCallback(
    debounce((value) => {
      if (value?.trim()) {
        getProduct(value);
      }
    }, 400),
    []
  );

  return (
    <div className="card-body px-3 py-1">
      <form onSubmit={formik.handleSubmit}>
        <div className="row row-cols-1 g-3">
          <div className="col position-relative">
            {" "}
            {/* Added position-relative for spinner */}
            <label className="form-label font-weight-500" htmlFor="product">
              Product
            </label>
            <Select
              options={productOptions}
              value={formik.values.product}
              isMulti
              onChange={(option) => formik.setFieldValue("product", option)}
              onBlur={() => formik.setFieldTouched("product", true)}
              placeholder="Select..."
              classNamePrefix="react-select"
              className={
                formik.touched.product && formik.errors.product
                  ? "is-invalid"
                  : ""
              }
              onInputChange={(value) => {
                debouncedGetProduct(value);
              }}
              // Removed isLoading and loadingMessage
              noOptionsMessage={({ inputValue }) =>
                inputValue
                  ? loading && (
                    <div
                      className="spinner-border spinner-border-sm text-primary"
                      role="status"
                    >
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  )
                  : "No options"
              }
            />
            {formik.touched.product && formik.errors.product && (
              <div className="text-danger mt-1">{formik.errors.product}</div>
            )}
          </div>
        </div>
        <div className="mt-4">
          <button type="submit" className="btn custom-button-bgcolor">
            Submit
          </button>
        </div>
      </form>

      {/* Rest of your code (table, etc.) remains unchanged */}
      <div className="card p-0 shadow-none border mt-5">
        <div className="card-body p-0">
          <div className="table-responsive mt-3 px-2">
            <table className="table table-sm">
              <thead className="text-xs text-uppercase text-muted bg-light border">
                <tr>
                  <th className="custom-perchase-th">Barcode</th>
                  <th className="custom-perchase-th">Date</th>
                  <th className="custom-perchase-th">Photo</th>
                  <th className="custom-perchase-th">Store</th>
                  <th className="custom-perchase-th">Sku</th>
                  <th className="custom-perchase-th">Brand</th>
                  <th className="custom-perchase-th">Mrp</th>
                  <th className="custom-perchase-th">Stock</th>
                  <th className="custom-perchase-th">Sold</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {inventory?.docs?.length > 0 ? (
                  inventory.docs.map((item, index) => (
                    <tr key={item.id || index}>
                      <td style={{ minWidth: "70px" }}>{item.product?.oldBarcode}</td>
                      <td style={{ minWidth: "100px" }}>{moment(item.product?.createdAt).format("YYYY-MM-DD")}</td>
                      <td>
                        <img
                          style={{ minWidth: "100px" }}
                          src={item.photo}
                          alt="Product"
                          width="40"
                          height="40"
                        />
                      </td>
                      <td style={{minWidth:"180px"}}>{item.store?.name}</td>
                      <td style={{minWidth:"180px"}}>{item.product?.sku}</td>
                      <td style={{minWidth:"180px"}}>{item.product?.brand?.name} {item.product?.__t}</td>
                      <td>{item.product?.MRP}</td>
                      <td>{item.quantity}</td>
                      <td>{item.sold}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="9"
                      className="text-center add_power_title py-3"
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
      </div>
    </div>
  );
};

export default ViewProductForm;
