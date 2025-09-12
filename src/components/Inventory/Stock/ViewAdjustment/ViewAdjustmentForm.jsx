import React, { useEffect, useState, useCallback } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import debounce from "lodash/debounce";
import { inventoryService } from "../../../../services/inventoryService";
import { toast } from "react-toastify";

const ViewAdjustmentForm = () => {
  const [productData, setProductData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [storeData, setStoreData] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalDocs: 0,
    totalPages: 0,
    hasPrevPage: false,
    hasNextPage: false,
  });
  const [searchQuery] = useState("");
  const [loadingInventory, setLoadingInventory] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  // Formik setup with Yup validation
  const formik = useFormik({
    initialValues: {
      stores: [],
      product: null,
    },
    validationSchema: Yup.object({
      stores: Yup.array().notRequired(),
      product: Yup.object().notRequired(),
    }),
    onSubmit: (values) => {
      console.log("Form submitted:", values);
      // Reset to first page on new filter
      setPagination((p) => ({ ...p, page: 1 }));
      getInventoryData(values, 1, pagination.limit);
    },
  });

  useEffect(() => {
    getStores();
    getInventoryData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    []
  );

  const productOptions = productData?.docs?.map((vendor) => ({
    value: vendor._id,
    label: `${vendor.oldBarcode} ${vendor.sku}`,
  }));

  const storeOptions = storeData?.map((vendor) => ({
    value: vendor._id,
    label: `${vendor.name}`,
  }));

  const getInventoryData = async (
    values = formik.values,
    page = pagination.page,
    limit = pagination.limit
  ) => {
    const storeId = values?.stores?.map((option) => option.value);
    console.log("storeId", storeId);
    console.log("values", values);
    setLoadingInventory(true);

    try {
      const response = await inventoryService.getAdjustment(
        values?.selectedProduct?.value,
        storeId,
        page,
        searchQuery,
        limit
      );
      if (response.success) {
        const container = response?.data?.data;
        setInventory(container);
        // Update pagination if available
        const totalDocs =
          container?.totalDocs ??
          container?.total ??
          (container?.docs?.length || 0);
        const currentPage = container?.page ?? page;
        const currentLimit = container?.limit ?? limit;
        const totalPages =
          container?.totalPages ??
          Math.ceil((totalDocs || 0) / (currentLimit || 1));
        const hasPrevPage =
          typeof container?.hasPrevPage === "boolean"
            ? container.hasPrevPage
            : currentPage > 1;
        const hasNextPage =
          typeof container?.hasNextPage === "boolean"
            ? container.hasNextPage
            : currentPage < totalPages;
        setPagination({
          page: currentPage,
          limit: currentLimit,
          totalDocs,
          totalPages,
          hasPrevPage,
          hasNextPage,
        });
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("error:", error);
    } finally {
      setLoadingInventory(false);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeData]);

  return (
    <>
      <div className="card-body px-3 py-1">
        <form onSubmit={formik.handleSubmit}>
          <div className="row row-cols-1  g-3">
            <div className="col">
              <label className="form-label font-weight-500" htmlFor="product">
                Select Product
              </label>
              <Select
                options={productOptions}
                value={formik.values.product}
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
                isLoading={loading}
                loadingMessage={() => "Loading..."}
                noOptionsMessage={({ inputValue }) =>
                  inputValue ? "No products found" : "Type to search"
                }
              />
              {formik.touched.product && formik.errors.product && (
                <div className="text-danger mt-1">{formik.errors.product}</div>
              )}
            </div>
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
          </div>
          <div className="my-4">
            <button
              type="submit"
              className="btn custom-button-bgcolor"
              // disabled={formik.isSubmitting}
            >
              Submit
            </button>
          </div>
        </form>
      </div>

      <div className="table-responsive px-2">
        {loadingInventory ? (
          <div className="d-flex justify-content-center">
            <h4>Loading Data...</h4>
          </div>
        ) : (
          <table className="table table-sm">
            <thead className="text-xs text-uppercase text-muted bg-light border">
              <tr>
                <th className="custom-perchase-th">Adjustment ID</th>
                <th className="custom-perchase-th">Store</th>
                <th className="custom-perchase-th">Barcode</th>
                <th className="custom-perchase-th">Sku</th>
                <th className="custom-perchase-th">Old Stock</th>
                <th className="custom-perchase-th">New Stock</th>
                <th className="custom-perchase-th">Reason</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {inventory?.docs?.length > 0 ? (
                inventory.docs.map((item, index) => (
                  <tr key={item.id || index}>
                    <td>{item.adjustmentId}</td>
                    <td>{item.store?.name}</td>

                    <td>{item.product?.oldBarcode}</td>
                    <td>{item.product?.sku}</td>

                    <td>{item.stock}</td>
                    <td>{item.newQuantity}</td>

                    <td>{item.reason}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center add_power_title py-3">
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
          {(() => {
            const startRow =
              pagination.totalDocs === 0
                ? 0
                : (pagination.page - 1) * pagination.limit + 1;
            const endRow = Math.min(
              pagination.page * pagination.limit,
              pagination.totalDocs
            );
            return (
              <>
                Showing <span className="fw-medium">{startRow}</span> to{" "}
                <span className="fw-medium">{endRow}</span> of{" "}
                <span className="fw-medium">{pagination.totalDocs}</span>{" "}
                results
              </>
            );
          })()}
        </div>
        <div className="btn-group">
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={() =>
              getInventoryData(
                formik.values,
                pagination.page - 1,
                pagination.limit
              )
            }
            disabled={!pagination.hasPrevPage || loadingInventory}
          >
            Previous
          </button>
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={() =>
              getInventoryData(
                formik.values,
                pagination.page + 1,
                pagination.limit
              )
            }
            disabled={!pagination.hasNextPage || loadingInventory}
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
};

export default ViewAdjustmentForm;
