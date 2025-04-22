import React from "react";
import { useFormik } from "formik";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ProductPurchaseReportsForm = ({ onSubmit }) => {
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
    <form onSubmit={formik.handleSubmit} className="mt-3">
      <div className="row g-3">
        {/* Store Field */}
        <div className="col-12 col-md-6 col-lg-3">
          <label htmlFor="store" className="form-label fw-medium">
            Select Store
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

        {/* Vendor Field */}
        <div className="col-12 col-md-6 col-lg-3">
          <label htmlFor="vendor" className="form-label fw-medium">
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

        {/* Date From Field */}
        <div className="col-12 col-md-6 col-lg-3">
          <label htmlFor="from" className="form-label fw-medium">
            Date From
          </label>
          <DatePicker
            selected={formik.values.from}
            onChange={(date) => formik.setFieldValue("from", date)}
            onBlur={() => formik.setFieldTouched("from", true)}
            dateFormat="dd/MM/yyyy"
            className="form-control"
            id="from"
            name="from"
            autoComplete="off"
            placeholderText="Select date"
          />
        </div>

        {/* Date To Field */}
        <div className="col-12 col-md-6 col-lg-3">
          <label htmlFor="to" className="form-label fw-medium">
            Date To
          </label>
          <DatePicker
            selected={formik.values.to}
            onChange={(date) => formik.setFieldValue("to", date)}
            onBlur={() => formik.setFieldTouched("to", true)}
            dateFormat="dd/MM/yyyy"
            className="form-control"
            id="to"
            name="to"
            autoComplete="off"
            placeholderText="Select date"
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

export default ProductPurchaseReportsForm;
