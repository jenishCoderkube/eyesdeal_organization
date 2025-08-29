import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import { inventoryService } from "../../services/inventoryService";
import { toast } from "react-toastify";

// Validation schema
const validationSchema = Yup.object({
  store: Yup.object().nullable().required("Store is required"),
  bulkUploadFile: Yup.mixed().required("File is required"),
});

const BulkUploadInventory = () => {
  const [storeData, setStoreData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const user = JSON.parse(localStorage.getItem("user"));

  const formik = useFormik({
    initialValues: {
      store: null,
      bulkUploadFile: null,
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setShowLoader(true);
      setProcessedCount(0);
      try {
        // Call bulk upload API
        const uploadResponse = await inventoryService.bulkUpload(
          values.store.value,
          values.bulkUploadFile
        );

        if (uploadResponse.success) {
          toast.success(uploadResponse.data.message || "Upload complete");

          // Iterate over the uploaded data and call updateInventoryData for each record
          // const docs = uploadResponse.data.data.docs || [];
          // setTotalCount(docs.length);

          // if (docs.length === 0) {
          //   toast.warn("No records found in the uploaded file");
          //   return;
          // }

          // let errorCount = 0;
          // for (const doc of docs) {
          //   // Validate and sanitize quantity
          //   const quantity = parseFloat(doc.quantity);
          //   if (isNaN(quantity) || quantity < 0) {
          //     toast.error(
          //       `Invalid quantity for Barcode ${doc.Barcode}: ${
          //         doc.quantity || "missing"
          //       }`
          //     );
          //     errorCount++;
          //     setProcessedCount((prev) => prev + 1); // Increment even for skipped records
          //     continue;
          //   }

          //   // Prepare payload
          //   const payload = {
          //     ...doc,
          //     store: values.store.value,
          //     quantity: quantity,
          //   };

          //   console.log(`Sending payload for Barcode ${doc.Barcode}:`, payload);

          //   const updateResponse = await inventoryService.updateInventoryData(
          //     payload
          //   );
          //   setProcessedCount((prev) => prev + 1); // Increment after each API call
          //   if (!updateResponse.success) {
          //     toast.error(
          //       `Failed to update inventory for Barcode ${doc.Barcode}: ${updateResponse.message}`
          //     );
          //     errorCount++;
          //   }
          // }

          // if (errorCount === 0) {
          //   toast.success("All inventory records updated successfully");
          // } else {
          //   toast.warn(`${errorCount} record(s) failed to update`);
          // }
        }
      } catch (error) {
        // toast.error("Error processing bulk upload");
        console.error("Bulk upload error:", error);
      } finally {
        setLoading(false);
        setShowLoader(false);
        setProcessedCount(0);
        setTotalCount(0);
        formik.resetForm();
      }
    },
  });

  const handleFileChange = (event) => {
    const file = event.currentTarget.files[0];
    formik.setFieldValue("bulkUploadFile", file);
  };

  useEffect(() => {
    getStores();
  }, []);

  const getStores = async () => {
    setLoading(true);
    try {
      const response = await inventoryService.getStores();
      if (response.success) {
        setStoreData(response?.data?.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("error:", error);
    } finally {
      setLoading(false);
    }
  };

  const storeOptions = storeData?.map((vendor) => ({
    value: vendor._id,
    label: `${vendor.name}`,
  }));

  useEffect(() => {
    const storedStoreId = user?.stores?.[0];
    if (storedStoreId && storeData.length > 0) {
      const defaultStore = storeData.find(
        (store) => store._id === storedStoreId
      );
      if (defaultStore) {
        formik.setFieldValue("store", [
          {
            value: defaultStore._id,
            label: defaultStore.name,
          },
        ]);
      }
    }
  }, [storeData]);

  // Calculate progress percentage
  const progressPercentage =
    totalCount > 0 ? (processedCount / totalCount) * 100 : 0;

  return (
    <div className="container-fluid px-4 py-8">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10">
          <h1 className="h2 text-dark fw-bold my-4">Bulk Upload Customers</h1>
          <div className="card shadow-sm mb-4 border-0">
            <div className="card-body p-4">
              {showLoader ? (
                <div className="text-center">
                  <div
                    className="spinner-border text-primary mb-3"
                    role="status"
                  >
                    <span className="visually-hidden">Processing...</span>
                  </div>
                  <h5>Processing Records</h5>
                  <p>
                    Processed {processedCount} of {totalCount} records
                  </p>
                  <div className="progress" style={{ height: "20px" }}>
                    <div
                      className="progress-bar bg-primary"
                      role="progressbar"
                      style={{ width: `${progressPercentage}%` }}
                      aria-valuenow={progressPercentage}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    >
                      {Math.round(progressPercentage)}%
                    </div>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={formik.handleSubmit}
                  className="d-flex flex-column"
                  style={{ gap: "1rem" }}
                >
                  <div className="w-100">
                    <label
                      className="form-label font-weight-500"
                      htmlFor="store"
                    >
                      Store <span className="text-danger">*</span>
                    </label>
                    <Select
                      options={storeOptions}
                      value={formik.values.store}
                      onChange={(option) =>
                        formik.setFieldValue("store", option)
                      }
                      onBlur={() => formik.setFieldTouched("store", true)}
                      placeholder="Select..."
                      classNamePrefix="react-select"
                      className={
                        formik.touched.store && formik.errors.store
                          ? "is-invalid"
                          : ""
                      }
                      isLoading={loading}
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
                      className="btn custom-button-bgcolor"
                      disabled={formik.isSubmitting || loading}
                    >
                      {loading ? (
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                      ) : null}
                      Submit
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkUploadInventory;
