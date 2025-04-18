import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Select from "react-select";

const ViewProductForm = () => {
  const productOptions = [
    { value: "rayBan", label: "Ray-Ban" },
    { value: "oakley", label: "Oakley" },
  ];

  // Formik setup with Yup validation
  const formik = useFormik({
    initialValues: {
      stores: [],
      product: null,
    },
    validationSchema: Yup.object({
      stores: Yup.array()
        .of(Yup.object().shape({ value: Yup.string(), label: Yup.string() }))
        .min(1, "At least one store is required")
        .required("Store is required"),
      product: Yup.object().nullable().required("Product is required"),
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
            <label className="form-label fw-medium" htmlFor="product">
              Product <span className="text-danger">*</span>
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
            />
            {formik.touched.product && formik.errors.product && (
              <div className="text-danger mt-1">{formik.errors.product}</div>
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

export default ViewProductForm;
