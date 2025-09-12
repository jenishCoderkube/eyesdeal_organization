import React, { useCallback, useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import { FaSearch } from "react-icons/fa";
import ReactPaginate from "react-paginate";
import { inventoryService } from "../../../services/inventoryService";
import { toast } from "react-toastify";
import debounce from "lodash/debounce";
import moment from "moment";

const ViewProductForm = () => {
  const [inventory, setInventory] = useState({
    docs: [],
    totalPages: 1,
    totalDocs: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [productData, setProductData] = useState({ docs: [] });
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 20;

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
      setCurrentPage(0); // Reset to first page on submit
      getInventoryData(values, 1);
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
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const getInventoryData = async (values, page) => {
    const productIds = values?.product?.map((option) => option.value);
    setLoadingInventory(true);
    try {
      const response = await inventoryService.getProductStore(
        productIds,
        page,
        itemsPerPage,
        true,
        searchQuery.trim() ? searchQuery : ""
      );
      if (response.success) {
        setInventory({
          docs: response?.data?.data?.docs || [],
          totalPages: response?.data?.data?.totalPages || 1,
          totalDocs: response?.data?.data?.totalDocs || 0,
        });
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("error:", error);
      toast.error("Failed to fetch inventory data");
    } finally {
      setLoadingInventory(false);
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

  // Handle search with debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim()) {
        setCurrentPage(0);
        getInventoryData(formik.values, 1);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, formik.values]);

  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
    getInventoryData(formik.values, event.selected + 1);
  };

  return (
    <div className="card-body px-3 py-1">
      <form onSubmit={formik.handleSubmit}>
        <div className="row row-cols-1 g-3">
          <div className="col position-relative">
            <label className="form-label font-weight-500" htmlFor="product">
              Product
            </label>
            <Select
              options={productOptions}
              value={formik.values.product}
              isMulti
              onChange={(option) => formik.setFieldValue("product", option)}
              onBlur={() => formik.setFieldTouched("product", true)}
              placeholder="Select products..."
              classNamePrefix="react-select"
              className={
                formik.touched.product && formik.errors.product
                  ? "is-invalid"
                  : ""
              }
              onInputChange={(value) => {
                debouncedGetProduct(value);
              }}
              noOptionsMessage={({ inputValue }) =>
                inputValue ? (
                  loading ? (
                    <div
                      className="spinner-border spinner-border-sm text-primary"
                      role="status"
                    >
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  ) : (
                    "No products found"
                  )
                ) : (
                  "Type to search products"
                )
              }
            />
            {formik.touched.product && formik.errors.product && (
              <div className="text-danger mt-1">{formik.errors.product}</div>
            )}
          </div>
          <div className="col position-relative">
            <label className="form-label font-weight-500">Search</label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <FaSearch className="text-muted" style={{ color: "#94a3b8" }} />
              </span>
              <input
                type="search"
                className="form-control border-start-0 py-2"
                placeholder="Search by barcode, SKU, store, or brand..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="mt-4">
          <button
            type="submit"
            className="btn custom-button-bgcolor"
            disabled={loadingInventory}
          >
            {loadingInventory ? "Loading..." : "Submit"}
          </button>
        </div>
      </form>

      <div className="card p-0 shadow-none border mt-5">
        <div className="card-body p-0">
          <div className="table-responsive mt-3 px-2">
            {loadingInventory ? (
              <div className="d-flex justify-content-center">
                <h4>Loading Data...</h4>
              </div>
            ) : (
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
                      <tr key={item._id || index}>
                        <td style={{ minWidth: "70px" }}>
                          {item.product?.newBarcode}
                        </td>
                        <td style={{ minWidth: "100px" }}>
                          {moment(item.product?.createdAt).format("YYYY-MM-DD")}
                        </td>
                        <td>
                          <img
                            style={{ minWidth: "100px" }}
                            src={item.photo}
                            alt="Product"
                            width="40"
                            height="40"
                          />
                        </td>
                        <td style={{ minWidth: "180px" }}>
                          {item.store?.name}
                        </td>
                        <td style={{ minWidth: "180px" }}>
                          {item.product?.sku}
                        </td>
                        <td style={{ minWidth: "180px" }}>
                          {item.product?.brand?.name} {item.product?.__t}
                        </td>
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
            )}
          </div>
          <div className="d-flex px-3 pb-3 flex-column flex-sm-row justify-content-between align-items-center mt-3">
            <div className="text-sm text-muted mb-3 mb-sm-0">
              Showing{" "}
              <span className="fw-medium">
                {currentPage * itemsPerPage + 1}
              </span>{" "}
              to{" "}
              <span className="fw-medium">
                {Math.min(
                  (currentPage + 1) * itemsPerPage,
                  inventory.totalDocs
                )}
              </span>{" "}
              of <span className="fw-medium">{inventory.totalDocs}</span>{" "}
              results
            </div>
            <ReactPaginate
              previousLabel={"Previous"}
              nextLabel={"Next"}
              breakLabel={"..."}
              pageCount={inventory.totalPages}
              marginPagesDisplayed={2}
              pageRangeDisplayed={5}
              onPageChange={handlePageClick}
              containerClassName={"pagination btn-group"}
              pageClassName={"btn btn-outline-primary"}
              previousClassName={"btn btn-outline-primary"}
              nextClassName={"btn btn-outline-primary"}
              breakClassName={"btn btn-outline-primary"}
              activeClassName={"active"}
              disabledClassName={"disabled"}
              forcePage={currentPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProductForm;
