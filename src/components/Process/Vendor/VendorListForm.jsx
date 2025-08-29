import React, { useEffect } from "react";
import { useFormik } from "formik";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const VendorListForm = ({
  onSubmit,
  stores,
  vendors,
  loading,
  initialStore,
}) => {
  const formik = useFormik({
    initialValues: {
      store: initialStore || null,
      vendor: null,
      from: null,
      to: null,
    },
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  // Update formik.values.store when initialStore changes
  useEffect(() => {
    if (initialStore && formik.values.store !== initialStore) {
      formik.setFieldValue("store", initialStore);
    }
  }, [initialStore, formik]);

  console.log("formik.values.store:", formik.values.store);
  console.log("stores prop:", stores);
  console.log("initialStore prop:", initialStore);

  return (
    <form onSubmit={formik.handleSubmit}>
      <div className="row g-3">
        <div className="col-12">
          <label htmlFor="vendor" className="form-label fw-medium text-black">
            Vendor
          </label>
          <Select
            options={vendors}
            value={formik.values.vendor}
            onChange={(option) => formik.setFieldValue("vendor", option)}
            onBlur={() => formik.setFieldTouched("vendor", true)}
            placeholder="Select..."
            classNamePrefix="react-select"
            id="vendor"
            isDisabled={loading}
          />
        </div>
        <div className="col-12">
          <label htmlFor="store" className="form-label fw-medium text-black">
            Store
          </label>
          <Select
            options={stores}
            value={formik.values.store}
            onChange={(option) => formik.setFieldValue("store", option)}
            onBlur={() => formik.setFieldTouched("store", true)}
            placeholder="Select..."
            classNamePrefix="react-select"
            id="store"
            isDisabled={loading}
          />
        </div>
        <div className="col-12 d-flex gap-2 mt-3">
          <button
            className="btn custom-button-bgcolor"
            type="submit"
            disabled={loading}
          >
            {loading ? "Loading..." : "Submit"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default VendorListForm;
