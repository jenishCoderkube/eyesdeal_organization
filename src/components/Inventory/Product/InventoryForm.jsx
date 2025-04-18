import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Select from "react-select";

const InventoryForm = () => {
  // Options for select fields
  const storeOptions = [
    { value: "store1", label: "Store1" },
    { value: "store2", label: "Store2" },
  ];
  const productOptions = [
    { value: "eyeGlasses", label: "Eye Glasses" },
    { value: "sunglasses", label: "Sunglasses" },
  ];
  const brandOptions = [
    { value: "rayBan", label: "Ray-Ban" },
    { value: "oakley", label: "Oakley" },
  ];
  const frameTypeOptions = [
    { value: "fullRim", label: "Full Rim" },
    { value: "rimless", label: "Rimless" },
  ];
  const frameShapeOptions = [
    { value: "round", label: "Round" },
    { value: "rectangle", label: "Rectangle" },
  ];
  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "unisex", label: "Unisex" },
  ];
  const frameMaterialOptions = [
    { value: "metal", label: "Metal" },
    { value: "plastic", label: "Plastic" },
  ];
  const frameColorOptions = [
    { value: "transparentBrown", label: "Transparent Brown" },
    { value: "black", label: "Black" },
  ];
  const frameSizeOptions = [
    { value: "small", label: "Small" },
    { value: "medium", label: "Medium" },
    { value: "large", label: "Large" },
  ];
  const prescriptionTypeOptions = [
    { value: "singleVision", label: "Single Vision" },
    { value: "bifocal", label: "Bifocal" },
  ];
  const frameCollectionOptions = [
    { value: "premium", label: "Premium" },
    { value: "standard", label: "Standard" },
  ];

  // Formik setup with Yup validation
  const formik = useFormik({
    initialValues: {
      stores: [],
      selectedProduct: null,
      brand: null,
      frameType: null,
      frameShape: null,
      gender: null,
      frameMaterial: null,
      frameColor: null,
      frameSize: null,
      prescriptionType: null,
      frameCollection: null,
    },
    validationSchema: Yup.object({
      stores: Yup.array()
        .of(Yup.object().shape({ value: Yup.string(), label: Yup.string() }))
        .min(1, "At least one store is required")
        .required("Store is required"),
      selectedProduct: Yup.object().nullable().required("Product is required"),
      brand: Yup.object().nullable().required("Brand is required"),
    }),
    onSubmit: (values) => {
      console.log("Form submitted:", values);
      alert("Form submitted successfully!");
    },
  });

  return (
    <div className="card-body px-3 py-3">
      <form onSubmit={formik.handleSubmit}>
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
          <div className="col">
            <label className="form-label fw-medium" htmlFor="stores">
              Store <span className="text-danger">*</span>
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
            <label className="form-label fw-medium" htmlFor="selectedProduct">
              Product <span className="text-danger">*</span>
            </label>
            <Select
              options={productOptions}
              value={formik.values.selectedProduct}
              onChange={(option) =>
                formik.setFieldValue("selectedProduct", option)
              }
              onBlur={() => formik.setFieldTouched("selectedProduct", true)}
              placeholder="Select..."
              classNamePrefix="react-select"
              className={
                formik.touched.selectedProduct && formik.errors.selectedProduct
                  ? "is-invalid"
                  : ""
              }
            />
            {formik.touched.selectedProduct &&
              formik.errors.selectedProduct && (
                <div className="text-danger mt-1">
                  {formik.errors.selectedProduct}
                </div>
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
          <div className="col">
            <label className="form-label fw-medium" htmlFor="frameType">
              Frame Type
            </label>
            <Select
              options={frameTypeOptions}
              value={formik.values.frameType}
              onChange={(option) => formik.setFieldValue("frameType", option)}
              onBlur={() => formik.setFieldTouched("frameType", true)}
              placeholder="Select..."
              classNamePrefix="react-select"
            />
          </div>
          <div className="col">
            <label className="form-label fw-medium" htmlFor="frameShape">
              Frame Shape
            </label>
            <Select
              options={frameShapeOptions}
              value={formik.values.frameShape}
              onChange={(option) => formik.setFieldValue("frameShape", option)}
              onBlur={() => formik.setFieldTouched("frameShape", true)}
              placeholder="Select..."
              classNamePrefix="react-select"
            />
          </div>
          <div className="col">
            <label className="form-label fw-medium" htmlFor="gender">
              Gender
            </label>
            <Select
              options={genderOptions}
              value={formik.values.gender}
              onChange={(option) => formik.setFieldValue("gender", option)}
              onBlur={() => formik.setFieldTouched("gender", true)}
              placeholder="Select..."
              classNamePrefix="react-select"
            />
          </div>
          <div className="col">
            <label className="form-label fw-medium" htmlFor="frameMaterial">
              Frame Material
            </label>
            <Select
              options={frameMaterialOptions}
              value={formik.values.frameMaterial}
              onChange={(option) =>
                formik.setFieldValue("frameMaterial", option)
              }
              onBlur={() => formik.setFieldTouched("frameMaterial", true)}
              placeholder="Select..."
              classNamePrefix="react-select"
            />
          </div>
          <div className="col">
            <label className="form-label fw-medium" htmlFor="frameColor">
              Frame Color
            </label>
            <Select
              options={frameColorOptions}
              value={formik.values.frameColor}
              onChange={(option) => formik.setFieldValue("frameColor", option)}
              onBlur={() => formik.setFieldTouched("frameColor", true)}
              placeholder="Select..."
              classNamePrefix="react-select"
            />
          </div>
          <div className="col">
            <label className="form-label fw-medium" htmlFor="frameSize">
              Frame Size
            </label>
            <Select
              options={frameSizeOptions}
              value={formik.values.frameSize}
              onChange={(option) => formik.setFieldValue("frameSize", option)}
              onBlur={() => formik.setFieldTouched("frameSize", true)}
              placeholder="Select..."
              classNamePrefix="react-select"
            />
          </div>
          <div className="col">
            <label className="form-label fw-medium" htmlFor="prescriptionType">
              Prescription Type
            </label>
            <Select
              options={prescriptionTypeOptions}
              value={formik.values.prescriptionType}
              onChange={(option) =>
                formik.setFieldValue("prescriptionType", option)
              }
              onBlur={() => formik.setFieldTouched("prescriptionType", true)}
              placeholder="Select..."
              classNamePrefix="react-select"
            />
          </div>
          <div className="col">
            <label className="form-label fw-medium" htmlFor="frameCollection">
              Frame Collection
            </label>
            <Select
              options={frameCollectionOptions}
              value={formik.values.frameCollection}
              onChange={(option) =>
                formik.setFieldValue("frameCollection", option)
              }
              onBlur={() => formik.setFieldTouched("frameCollection", true)}
              placeholder="Select..."
              classNamePrefix="react-select"
            />
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

export default InventoryForm;
