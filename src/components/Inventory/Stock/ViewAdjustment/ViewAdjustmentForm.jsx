import React, { useEffect, useState, useCallback } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import debounce from "lodash/debounce";
import { inventoryService } from "../../../../services/inventoryService";

const ViewAdjustmentForm = () => {
  const [productData, setProductData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [storeData, setStoreData] = useState([]);

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
      alert("Form submitted successfully!");
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
      console.error(" error:", error);
    } finally {
      setLoading(false);
    }
  };

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

  return (
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
        <div className="mt-4">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={formik.isSubmitting}
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default ViewAdjustmentForm;
