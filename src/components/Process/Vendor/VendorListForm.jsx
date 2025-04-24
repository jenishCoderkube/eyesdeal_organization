import React from "react";
import { useFormik } from "formik";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const VendorListForm = ({ onSubmit }) => {
  // Options for select fields
  const storeOptions = [
    { value: "EYESDEAL BARDOLI", label: "EYESDEAL BARDOLI" },
    { value: "CITY OPTICS", label: "CITY OPTICS" },
    { value: "ELITE HOSPITAL", label: "ELITE HOSPITAL" },
  ];
  const vendorOptions = [
    { value: "Vision Suppliers", label: "Vision Suppliers" },
    { value: "Optic Distributors", label: "Optic Distributors" },
    { value: "Lens Crafters", label: "Lens Crafters" },
  ];

  // Formik setup without validation
  const formik = useFormik({
    initialValues: {
      store: null,
      vendor: null,
      from: null,
      to: null,
    },
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <div className="row g-3">
        {/* Vendor Field */}
        <div className="col-12 ">
          <label htmlFor="vendor" className="form-label fw-medium text-black">
            Vendor
          </label>
          <Select
            options={vendorOptions}
            value={formik.values.vendor}
            onChange={(option) => formik.setFieldValue("vendor", option)}
            onBlur={() => formik.setFieldTouched("vendor", true)}
            placeholder="Select..."
            classNamePrefix="react-select"
            id="vendor"
          />
        </div>
        {/* Store Field */}
        <div className="col-12 ">
          <label htmlFor="store" className="form-label fw-medium text-black">
            Store
          </label>
          <Select
            options={storeOptions}
            value={formik.values.store}
            onChange={(option) => formik.setFieldValue("store", option)}
            onBlur={() => formik.setFieldTouched("store", true)}
            placeholder="Select..."
            classNamePrefix="react-select"
            id="store"
          />
        </div>
        {/* Buttons */}
        <div className="col-12 d-flex gap-2 mt-3">
          <button
            className="btn btn-primary"
            type="submit"
            disabled={formik.isSubmitting}
          >
            Submit
          </button>
        </div>
      </div>
    </form>
  );
};

export default VendorListForm;
