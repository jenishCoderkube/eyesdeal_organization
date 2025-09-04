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
      store: initialStore || [], // Ensure store is initialized as an array
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
    if (initialStore?.length) {
      formik.setFieldValue("store", initialStore);
    }
  }, [initialStore]); // Remove formik from dependencies

  return (
    <form onSubmit={formik.handleSubmit}>
      <div className="row g-3">
        {/* Vendor */}
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

        {/* Store - Multiple Select */}
        <div className="col-12">
          <label htmlFor="store" className="form-label fw-medium text-black">
            Store
          </label>
          <Select
            options={stores}
            value={formik.values.store}
            onChange={(options) => formik.setFieldValue("store", options || [])}
            onBlur={() => formik.setFieldTouched("store", true)}
            placeholder="Select..."
            classNamePrefix="react-select"
            id="store"
            isMulti
            isDisabled={loading}
          />
        </div>

        {/* Submit Button */}
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
