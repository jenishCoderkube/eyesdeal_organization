import React from "react";
import { useFormik } from "formik";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "bootstrap/dist/css/bootstrap.min.css";

const SalesReportsForm = ({ onSubmit }) => {
  // Options for select fields
  const storeOptions = [
    { value: "EYESDEAL BARDOLI", label: "EYESDEAL BARDOLI" },
    { value: "CITY OPTICS", label: "CITY OPTICS" },
    { value: "ELITE HOSPITAL", label: "ELITE HOSPITAL" },
  ];
  const brandOptions = [
    { value: "SeeLens spectacleLens", label: "SeeLens spectacleLens" },
    { value: "I-Gog sunGlasses", label: "I-Gog sunGlasses" },
    { value: "Ray-Ban eyeGlasses", label: "Ray-Ban eyeGlasses" },
    { value: "Oakley sunGlasses", label: "Oakley sunGlasses" },
    { value: "Fizan eyeGlasses", label: "Fizan eyeGlasses" },
  ];

  // Formik setup without validation
  const formik = useFormik({
    initialValues: {
      store: null,
      brand: null,
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

        {/* Brand Field */}
        <div className="col-12 col-md-6 col-lg-3">
          <label htmlFor="brand" className="form-label fw-medium">
            Select Brand
          </label>
          <Select
            options={brandOptions}
            value={formik.values.brand}
            onChange={(option) => formik.setFieldValue("brand", option)}
            onBlur={() => formik.setFieldTouched("brand", true)}
            placeholder="Select..."
            classNamePrefix="react-select"
            id="brand"
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

export default SalesReportsForm;
