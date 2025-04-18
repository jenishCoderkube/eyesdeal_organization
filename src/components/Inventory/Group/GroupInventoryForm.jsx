import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Select from "react-select";

const GroupInventoryForm = () => {
  // Options for select fields
  const storeOptions = [
    { value: "store1", label: "Store1" },
    { value: "store2", label: "Store2" },
  ];
  const brandOptions = [
    { value: "rayBan", label: "Ray-Ban" },
    { value: "oakley", label: "Oakley" },
  ];

  // Formik setup with Yup validation
  const formik = useFormik({
    initialValues: {
      stores: [],
      brand: null,
    },
    validationSchema: Yup.object({
      stores: Yup.array()
        .of(Yup.object().shape({ value: Yup.string(), label: Yup.string() }))
        .min(1, "At least one store is required")
        .required("Store is required"),
      brand: Yup.object().nullable().required("Brand is required"),
    }),
    onSubmit: (values) => {
      console.log("Form submitted:", values);
      alert("Form submitted successfully!");
    },
  });

  return (
    <div className="card-body px-3 py-1">
      <form onSubmit={formik.handleSubmit}>
        <div className="row row-cols-1  g-3">
          <div className="col">
            <label className="form-label fw-medium" htmlFor="stores">
              Select Store <span className="text-danger">*</span>
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
            <label className="form-label fw-medium" htmlFor="brand">
              Brand <span className="text-danger">*</span>
            </label>
            <Select
              options={brandOptions}
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

export default GroupInventoryForm;
