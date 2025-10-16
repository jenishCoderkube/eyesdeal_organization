import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import { packageService } from "../../services/packageService";
import { storeService } from "../../services/storeService";
import { toast } from "react-toastify";

const validationSchema = Yup.object({
  // store: Yup.array().min(1, "At least one store is required"),
  package: Yup.object().required("Package is required"),
  bulkUploadFile: Yup.mixed().required("File is required"),
});

const BulkUploadPackage = () => {
  const [storeOptions, setStoreOptions] = useState([]);
  const [loadingStores, setLoadingStores] = useState(false);
  const [packageOptions, setPackageOptions] = useState([]);
  const [loadingPackages, setLoadingPackages] = useState(false);

  // 🔹 Fetch stores first
  useEffect(() => {
    getStores();
  }, []);

  const getStores = async () => {
    try {
      setLoadingStores(true);
      const res = await storeService.getStores();
      setLoadingStores(false);

      if (res?.length > 0) {
        const options = res?.map((store) => ({
          value: store._id,
          label: store.name,
        }));
        setStoreOptions(options);

        // default selected stores from localStorage
        const user = JSON.parse(localStorage.getItem("user"));
        const defaultIds = user?.stores || [];
        const defaultSelected = options.filter((opt) =>
          defaultIds.includes(opt.value)
        );

        formik.setFieldValue("store", defaultSelected);
      }
    } catch (err) {
      setLoadingStores(false);
      toast.error("Failed to load stores");
    }
  };

  // 🔹 Fetch packages based on selected stores
  const fetchPackages = async (storeIds = []) => {
    setLoadingPackages(true);
    const res = await packageService.getPackages(1, 1000, storeIds);
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

  const formik = useFormik({
    initialValues: {
      store: [],
      package: null,
      bulkUploadFile: null,
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const res = await packageService.bulkUploadPackages(
          values.package.value,
          values.bulkUploadFile,
          values.store.map((s) => s.value) // send store IDs
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

  // 🔹 Re-fetch packages when stores change
  useEffect(() => {
    if (formik.values.store && formik.values.store.length > 0) {
      fetchPackages(formik.values.store.map((s) => s.value));
    }
  }, [formik.values.store]);

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
                {/* 🔹 Store Selection */}
                <div className="w-50">
                  <label className="form-label font-weight-500" htmlFor="store">
                    Store <span className="text-danger">*</span>
                  </label>
                  <Select
                    isMulti
                    id="store"
                    options={storeOptions}
                    value={formik.values.store}
                    onChange={(sel) => formik.setFieldValue("store", sel)}
                    onBlur={() => formik.setFieldTouched("store", true)}
                    placeholder={
                      loadingStores ? "Loading stores..." : "Select store(s)..."
                    }
                    isLoading={loadingStores}
                    classNamePrefix="react-select"
                    className={
                      formik.touched.store && formik.errors.store
                        ? "is-invalid"
                        : ""
                    }
                  />
                  {formik.touched.store && formik.errors.store && (
                    <div className="text-danger mt-1">
                      {formik.errors.store}
                    </div>
                  )}
                </div>

                {/* 🔹 Package Selection */}
                <div className="w-100">
                  <label
                    className="form-label font-weight-500"
                    htmlFor="package"
                  >
                    Package <span className="text-danger">*</span>
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

                {/* 🔹 File Upload */}
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

                {/* 🔹 Submit */}
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
