import React from "react";
import { useFormik } from "formik";
import Select from "react-select";
import DatePicker from "react-datepicker";
import * as XLSX from "xlsx";
import "react-datepicker/dist/react-datepicker.css";
import "bootstrap/dist/css/bootstrap.min.css";

const SalesReportsForm = ({ onSubmit, data }) => {
  // Options for select fields
  const storeOptions = [
    { value: "EYESDEAL VARACCHA", label: "EYESDEAL VARACCHA" },
    { value: "EYESDEAL NAVSARI", label: "EYESDEAL NAVSARI" },
    { value: "EYESDEAL KAMREJ", label: "EYESDEAL KAMREJ" },
    { value: "EYESDEAL PALANPUR", label: "EYESDEAL PALANPUR" },
    { value: "EYESDEAL KATARGAM", label: "EYESDEAL KATARGAM" },
    {
      value: "EYESDEAL PANCHBATTI BHARUCH",
      label: "EYESDEAL PANCHBATTI BHARUCH",
    },
    { value: "EYESDEAL BARDOLI", label: "EYESDEAL BARDOLI" },
  ];

  // Formik setup without validation
  const formik = useFormik({
    initialValues: {
      store: [],
      from: null,
      to: null,
    },
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  // Export to Excel functions
  const exportToExcel = (data, filename) => {
    const worksheet = XLSX.utils.json_to_sheet(
      data.map((item) => ({
        SRNO: item.id,
        Store_Name: item.store,
        Customer_Name: item.customerName,
        Salesman_Name: item.salesmanName,
        Date: item.date,
        Bill_No: item.billNo,
        Total_Amount: item.totalAmount,
        Pending_Amount: item.pendingAmount,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "SalesReport");
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  const exportProduct = () => {
    exportToExcel(data, "SalesReport");
  };

  const exportCustomerData = () => {
    exportToExcel(data, "CustomerData");
  };

  return (
    <form onSubmit={formik.handleSubmit} className="mt-3">
      <div className="row g-3">
        {/* Store Field (Multiselect) */}
        <div className="col-12 col-md-6 col-lg-4">
          <label htmlFor="store" className="form-label font-weight-500">
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

        {/* Date From Field */}
        <div className="col-12 col-md-6 col-lg-4">
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
        <div className="col-12 col-md-6 col-lg-4">
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
