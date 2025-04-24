import React from "react";
import { useFormik } from "formik";
import Select from "react-select";
import DatePicker from "react-datepicker";
import * as XLSX from "xlsx";
import "react-datepicker/dist/react-datepicker.css";

const TransferReportsForm = ({ onSubmit, data }) => {
  // Options for select fields
  const storeOptions = [
    { value: "EYESDEAL YOGICHOWK", label: "EYESDEAL YOGICHOWK" },
    { value: "EYESDEAL VESU", label: "EYESDEAL VESU" },
    { value: "ED HO", label: "ED HO" },
    { value: "EYESDEAL NAVSARI", label: "EYESDEAL NAVSARI" },
  ];

  // Formik setup without validation
  const formik = useFormik({
    initialValues: {
      storeFrom: [],
      storeTo: [],
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
        Date: item.date,
        From_Store: item.fromStore,
        To_Store: item.toStore,
        SKU: item.sku,
        Stock_Quantity: item.stockQuantity,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "TransferReport");
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  const exportProduct = () => {
    exportToExcel(data, "TransferReport");
  };

  return (
    <form onSubmit={formik.handleSubmit} className="mt-3">
      <div className="row g-3">
        {/* Store From Field (Multiselect) */}
        <div className="col-12 col-md-6 col-lg-3">
          <label htmlFor="storeFrom" className="form-label font-weight-500">
            Store From
          </label>
          <Select
            options={storeOptions}
            value={formik.values.storeFrom}
            onChange={(options) =>
              formik.setFieldValue("storeFrom", options || [])
            }
            onBlur={() => formik.setFieldTouched("storeFrom", true)}
            placeholder="Select..."
            classNamePrefix="react-select"
            id="storeFrom"
            isMulti
          />
        </div>

        {/* Store To Field (Multiselect) */}
        <div className="col-12 col-md-6 col-lg-3">
          <label htmlFor="storeTo" className="form-label font-weight-500">
            Store To
          </label>
          <Select
            options={storeOptions}
            value={formik.values.storeTo}
            onChange={(options) =>
              formik.setFieldValue("storeTo", options || [])
            }
            onBlur={() => formik.setFieldTouched("storeTo", true)}
            placeholder="Select..."
            classNamePrefix="react-select"
            id="storeTo"
            isMulti
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
            disabled={formik.isSubmitting}
          >
            Submit
          </button>
        </div>
      </div>
    </form>
  );
};

export default TransferReportsForm;
