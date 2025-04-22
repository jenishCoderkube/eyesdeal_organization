import React from "react";
import { useFormik } from "formik";
import Select from "react-select";
import DatePicker from "react-datepicker";
import * as XLSX from "xlsx";
import "react-datepicker/dist/react-datepicker.css";

const CashReportsForm = ({ onSubmit, data }) => {
  // Options for select fields
  const modeOptions = [
    { value: "Cash", label: "Cash" },
    { value: "UPI", label: "UPI" },
    { value: "Card", label: "Card" },
    { value: "Bank", label: "Bank" },
  ];
  const storeOptions = [
    { value: "EYESDEAL BHAGATALAV", label: "EYESDEAL BHAGATALAV" },
    { value: "EYESDEAL VARACCHA", label: "EYESDEAL VARACCHA" },
    { value: "EYESDEAL ADAJAN", label: "EYESDEAL ADAJAN" },
    { value: "EYESDEAL BHATAR", label: "EYESDEAL BHATAR" },
    { value: "EYESDEAL KATARGAM", label: "EYESDEAL KATARGAM" },
    {
      value: "EYESDEAL PANCHBATTI BHARUCH",
      label: "EYESDEAL PANCHBATTI BHARUCH",
    },
    { value: "EYESDEAL BARDOLI", label: "EYESDEAL BARDOLI" },
    { value: "EYESDEAL PALANPUR", label: "EYESDEAL PALANPUR" },
    { value: "EYESDEAL NAVSARI", label: "EYESDEAL NAVSARI" },
  ];
  const typeOptions = [
    { value: "Credit(+)", label: "Credit(+)" },
    { value: "Debit(-)", label: "Debit(-)" },
  ];

  // Formik setup without validation
  const formik = useFormik({
    initialValues: {
      mode: [],
      store: [],
      type: [],
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
        Store_Name: item.store,
        Mode: item.mode,
        Expense_Category: item.expenseCategory,
        Type: item.type,
        Amount: item.amount,
        Note: item.note,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "CashReport");
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  const exportProduct = () => {
    exportToExcel(data, "CashReport");
  };

  return (
    <form onSubmit={formik.handleSubmit} className="mt-3">
      <div className="row g-3">
        {/* Mode Field (Multiselect) */}
        <div className="col-12 col-md-6 col-lg-2">
          <label htmlFor="mode" className="form-label fw-medium">
            Mode
          </label>
          <Select
            options={modeOptions}
            value={formik.values.mode}
            onChange={(options) => formik.setFieldValue("mode", options || [])}
            onBlur={() => formik.setFieldTouched("mode", true)}
            placeholder="Select..."
            classNamePrefix="react-select"
            id="mode"
            isMulti
          />
        </div>

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

        {/* Type Field (Multiselect) */}
        <div className="col-12 col-md-6 col-lg-2">
          <label htmlFor="type" className="form-label fw-medium">
            Type
          </label>
          <Select
            options={typeOptions}
            value={formik.values.type}
            onChange={(options) => formik.setFieldValue("type", options || [])}
            onBlur={() => formik.setFieldTouched("type", true)}
            placeholder="Select..."
            classNamePrefix="react-select"
            id="type"
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

export default CashReportsForm;
