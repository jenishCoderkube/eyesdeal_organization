import React from "react";
import { useFormik } from "formik";
import Select from "react-select";
import DatePicker from "react-datepicker";
import * as XLSX from "xlsx";
import "react-datepicker/dist/react-datepicker.css";

const EmployeeIncentiveReportsForm = ({ onSubmit, data }) => {
  // Options for select fields
  const employeeOptions = [
    { value: "HIRAL JAIN", label: "HIRAL JAIN" },
    { value: "RAJESH PATEL", label: "RAJESH PATEL" },
    { value: "SNEHA SHARMA", label: "SNEHA SHARMA" },
  ];

  // Formik setup without validation
  const formik = useFormik({
    initialValues: {
      employee: [],
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
        Order_No: item.orderNo,
        Brand: item.brand,
        SKU: item.sku,
        MRP: item.mrp,
        Discount: item.discount,
        Percentage: item.percentage,
        Incentive_Amount: item.incentiveAmount,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "IncentiveReport");
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  const exportProduct = () => {
    exportToExcel(data, "EmployeeIncentiveReport");
  };

  return (
    <form onSubmit={formik.handleSubmit} className="mt-3">
      <div className="row g-3">
        {/* Employee Field (Multiselect) */}
        <div className="col-12 col-md-6 col-lg-4">
          <label htmlFor="employee" className="form-label fw-medium">
            Select Employee
          </label>
          <Select
            options={employeeOptions}
            value={formik.values.employee}
            onChange={(options) =>
              formik.setFieldValue("employee", options || [])
            }
            onBlur={() => formik.setFieldTouched("employee", true)}
            placeholder="Select..."
            classNamePrefix="react-select"
            id="employee"
            isMulti
          />
        </div>

        {/* Date From Field */}
        <div className="col-12 col-md-6 col-lg-4">
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
        <div className="col-12 col-md-6 col-lg-4">
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

export default EmployeeIncentiveReportsForm;
