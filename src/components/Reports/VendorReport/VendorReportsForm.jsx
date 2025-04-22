import React from "react";
import { useFormik } from "formik";
import Select from "react-select";
import DatePicker from "react-datepicker";
import * as XLSX from "xlsx";
import "react-datepicker/dist/react-datepicker.css";
import "bootstrap/dist/css/bootstrap.min.css";

const VendorReportsForm = ({ onSubmit, data }) => {
  // Options for select fields
  const storeOptions = [
    { value: "EYESDEAL BARDOLI", label: "EYESDEAL BARDOLI" },
    { value: "CITY OPTICS", label: "CITY OPTICS" },
    { value: "ELITE HOSPITAL", label: "ELITE HOSPITAL" },
  ];
  const vendorOptions = [
    { value: "NICE OPTICAL VADODRA", label: "NICE OPTICAL VADODRA" },
    { value: "VISION SUPPLIERS", label: "VISION SUPPLIERS" },
    { value: "OPTIC DISTRIBUTORS", label: "OPTIC DISTRIBUTORS" },
  ];
  const statusOptions = [
    { value: "Received", label: "Received" },
    { value: "Damaged", label: "Damaged" },
    { value: "Pending", label: "Pending" },
  ];

  // Formik setup without validation
  const formik = useFormik({
    initialValues: {
      store: [],
      vendorName: [],
      status: [],
      from: null,
      to: null,
    },
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  // Export to Excel function
  const exportToExcel = (data, filename) => {
    const worksheet = XLSX.utils.json_to_sheet(
      data.map((item) => ({
        SRNO: item.id,
        Store_Name: item.store,
        Vendor_Name: item.vendorName,
        Date: item.date,
        Bill_No: item.billNo,
        SKU: item.sku,
        Status: item.status,
        Cost_Price: item.costPrice,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "VendorReport");
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  const exportProduct = () => {
    exportToExcel(data, "VendorReport");
  };

  return (
    <form onSubmit={formik.handleSubmit} className="mt-3">
      <div className="row g-3">
        {/* Store Field (Multiselect) */}
        <div className="col-12 col-md-6 col-lg-2">
          <label htmlFor="store" className="form-label fw-medium">
            Select Store
          </label>
          <Select
            options={storeOptions}
            value={formik.values.store}
            onChange={(options) => formik.setFieldValue("store", options || [])}
            onBlur={() => formik.setFieldTouched("store", true)}
            placeholder="Select..."
            classNamePrefix="react-select"
            id="store"
            isMulti
          />
        </div>

        {/* Vendor Name Field (Multiselect) */}
        <div className="col-12 col-md-6 col-lg-2">
          <label htmlFor="vendorName" className="form-label fw-medium">
            Vendor Name
          </label>
          <Select
            options={vendorOptions}
            value={formik.values.vendorName}
            onChange={(options) =>
              formik.setFieldValue("vendorName", options || [])
            }
            onBlur={() => formik.setFieldTouched("vendorName", true)}
            placeholder="Select..."
            classNamePrefix="react-select"
            id="vendorName"
            isMulti
          />
        </div>

        {/* Status Field (Multiselect) */}
        <div className="col-12 col-md-6 col-lg-2">
          <label htmlFor="status" className="form-label fw-medium">
            Select Status
          </label>
          <Select
            options={statusOptions}
            value={formik.values.status}
            onChange={(options) =>
              formik.setFieldValue("status", options || [])
            }
            onBlur={() => formik.setFieldTouched("status", true)}
            placeholder="Select..."
            classNamePrefix="react-select"
            id="status"
            isMulti
          />
        </div>

        {/* Date From Field */}
        <div className="col-12 col-md-6 col-lg-2">
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
        <div className="col-12 col-md-6 col-lg-2">
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

export default VendorReportsForm;
