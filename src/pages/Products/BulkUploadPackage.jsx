// Route: /products/bulk-upload-package
import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import { packageService } from "../../services/packageService";
import { toast } from "react-toastify";

const validationSchema = Yup.object({
  package: Yup.object().required("Package is required"),
  bulkUploadFile: Yup.mixed().required("File is required"),
});

const BulkUploadPackage = () => {
  const [packageOptions, setPackageOptions] = useState([]);
  const [loadingPackages, setLoadingPackages] = useState(false);

  useEffect(() => {
    const fetchPackages = async () => {
      setLoadingPackages(true);
      const res = await packageService.getPackages(1, 1000);
      setLoadingPackages(false);
      if (res.success) {
        const options = (res.data?.data || res.data || []).map((pkg) => ({
          value: pkg._id,
          label: pkg.packageName,
        }));
        setPackageOptions(options);
      } else {
        toast.error(res.message || "Failed to fetch packages");
      }
    };
    fetchPackages();
  }, []);

  const formik = useFormik({
    initialValues: {
      package: null,
      bulkUploadFile: null,
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const res = await packageService.bulkUploadPackages(
          values.package.value,
          values.bulkUploadFile
        );
        if (res.success) {
          toast.success(res.message || "Bulk upload successful");
          resetForm();
        } else {
          toast.error(res.message || "Bulk upload failed");
        }
      } catch (error) {
        toast.error("Bulk upload failed");
      }
    },
  });

  const handleFileChange = (event) => {
    const file = event.currentTarget.files[0];
    if (file && file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      toast.error("Please upload a CSV file.");
      return;
    }
    formik.setFieldValue("bulkUploadFile", file);
  };

  return (
    <div className="container-fluid px-4 py-8">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10">
          <h1 className="h2 text-dark fw-bold my-4">Bulk Upload Package</h1>
          <div className="card shadow-sm mb-4 border-0">
            <div className="card-body p-4">
              <form
                onSubmit={formik.handleSubmit}
                className="d-flex flex-column"
                style={{ gap: "1rem" }}
              >
                <div className="w-100">
                  <label
                    className="form-label font-weight-500"
                    htmlFor="package"
                  >
                    Package
                  </label>
                  <Select
                    options={packageOptions}
                    value={formik.values.package}
                    onChange={(option) =>
                      formik.setFieldValue("package", option)
                    }
                    onBlur={() => formik.setFieldTouched("package", true)}
                    placeholder={
                      loadingPackages ? "Loading packages..." : "Select..."
                    }
                    isLoading={loadingPackages}
                    classNamePrefix="react-select"
                    className={
                      formik.touched.package && formik.errors.package
                        ? "is-invalid"
                        : ""
                    }
                  />
                  {formik.touched.package && formik.errors.package && (
                    <div className="text-danger mt-1">
                      {formik.errors.package}
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
                    accept=".csv"
                    className={`form-control ${
                      formik.touched.bulkUploadFile &&
                      formik.errors.bulkUploadFile
                        ? "is-invalid"
                        : ""
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
                    disabled={formik.isSubmitting}
                  >
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

export default BulkUploadPackage;
