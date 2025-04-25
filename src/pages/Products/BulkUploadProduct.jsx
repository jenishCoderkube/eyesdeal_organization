import React, {useEffect, useState} from 'react';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import Select from 'react-select';
import {storeService} from '../../services/storeService';
import {productOptions} from '../../utils/constants';
import {uploadBulkProducts} from '../../services/bulkUpload';
import {toast} from 'react-toastify';

// Validation schema
const validationSchema = Yup.object({
  bulkUploadFile: Yup.mixed().required("File is required"),
});

// Dummy store options (replace with actual data if available)
// const storeOptions = [
//   { value: "eyesdeal_adajan", label: "EYESDEAL ADAJAN" },
//   { value: "eyesdeal_udhana", label: "EYESDEAL UDHANA" },
//   { value: "safent", label: "SAFENT" },
//   { value: "closed_nikol", label: "CLOSED NIKOL" },
//   { value: "elite_hospital", label: "ELITE HOSPITAL" },
// ];

const BulkUploadProduct = () => {
  // Formik setup
  const formik = useFormik({
    initialValues: {
      store: null,
      bulkUploadFile: null,
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const response = await uploadBulkProducts(
          values.bulkUploadFile,
          values.store.value,
        );
        if (response?.success) {
          toast.success(response.message);
          formik.resetForm();
        }
      } catch (error) {
        console.log('err', error);
      }
    },
  });

  // Handle file input change
  const handleFileChange = (event) => {
    const file = event.currentTarget.files[0];
    formik.setFieldValue('bulkUploadFile', file);
  };

  return (
    <div className="container-fluid px-4 py-8">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10">
          <h1 className="h2 text-dark fw-bold my-4">Bulk Upload Product</h1>
          <div className="card shadow-sm mb-4 border-0">
            <div className="card-body p-4">
              <form
                onSubmit={formik.handleSubmit}
                className="d-flex flex-column"
                style={{gap: '1rem'}}>
                <div className="w-100">
                  <label className="form-label font-weight-500" htmlFor="store">
                    Product Type
                  </label>
                  <Select
                    options={productOptions}
                    value={formik.values.store}
                    onChange={(option) => formik.setFieldValue('store', option)}
                    onBlur={() => formik.setFieldTouched('store', true)}
                    placeholder="Select..."
                    classNamePrefix="react-select"
                    className={
                      formik.touched.store && formik.errors.store
                        ? 'is-invalid'
                        : ''
                    }
                  />
                  {formik.touched.store && formik.errors.store && (
                    <div className="text-danger mt-1">
                      {formik.errors.store}
                    </div>
                  )}
                </div>
                <div className="w-100">
                  <label
                    className="form-label font-weight-500"
                    htmlFor="bulkUploadFile"
                  >
                    File <span className="text-danger">*</span>
                  </label>
                  <input
                    type="file"
                    name="bulkUploadFile"
                    className={`form-control ${
                      formik.touched.bulkUploadFile &&
                      formik.errors.bulkUploadFile
                        ? 'is-invalid'
                        : ''
                    }`}
                    onChange={handleFileChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.bulkUploadFile &&
                    formik.errors.bulkUploadFile && (
                      <div className="invalid-feedback">
                        {formik.errors.bulkUploadFile}
                      </div>
                    )}
                </div>
                <div>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={formik.isSubmitting}>
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkUploadProduct;
