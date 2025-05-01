import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { reportService } from "../../../services/reportService";
import { purchaseService } from "../../../services/purchaseService";

const PurchaseReportsForm = ({ onSubmit }) => {

  const [storeData, setStoreData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [vendorData, setVendorData] = useState([]);

  const storeOptions = storeData?.map((store) => ({
    value: store._id,
    label: `${store.name}`,
  }));

  const vendorOptions = vendorData?.map((vendor) => ({
    value: vendor._id,
    label: `${vendor.companyName}`,
  }));

  useEffect(() => {
    getStores();
    getVendorsByType();
  }, []);

  const getStores = async () => {
    setLoading(true);
    try {
      const response = await reportService.getStores();
      if (response.success) {
        setStoreData(response?.data?.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getVendorsByType = async () => {
    setLoading(true);
    try {
      const response = await purchaseService.getVendorsByType();
      if (response.success) {
        console.log(response)
        setVendorData(response?.data?.docs);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Formik setup without validation
  const formik = useFormik({
    initialValues: {
      store: null,
      vendor: null,
      from: new Date(),
      to: new Date(),
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
          <label htmlFor="store" className="form-label font-weight-500">
            Select Store
          </label>
          <Select
          isMulti
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
          <label htmlFor="vendor" className="form-label font-weight-500">
            Vendor
          </label>
          <Select
          isMulti
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
          <label htmlFor="from" className="form-label font-weight-500">
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
          <label htmlFor="to" className="form-label font-weight-500">
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
            disabled={loading}
          >
            Submit
          </button>
        </div>
      </div>
    </form>
  );
};

export default PurchaseReportsForm;
