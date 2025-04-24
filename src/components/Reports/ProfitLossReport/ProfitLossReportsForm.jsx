import React from "react";
import { useFormik } from "formik";
import Select from "react-select";
import DatePicker from "react-datepicker";
import * as XLSX from "xlsx";
import "react-datepicker/dist/react-datepicker.css";

const ProfitLossReportsForm = ({ onSubmit, data }) => {
  // Options for select fields
  const storeOptions = [
    { value: "EYESDEAL BHARUCH", label: "EYESDEAL BHARUCH" },
    { value: "EYESDEAL BARDOLI", label: "EYESDEAL BARDOLI" },
  ];
  const brandOptions = [
    { value: "I-Gog eyeGlasses", label: "I-Gog eyeGlasses" },
    { value: "I-Gog sunGlasses", label: "I-Gog sunGlasses" },
    { value: "Ray-Ban", label: "Ray-Ban" },
    { value: "Oakley", label: "Oakley" },
  ];

  // Formik setup without validation
  const formik = useFormik({
    initialValues: {
      store: [],
      brands: [],
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
        Date: item.date,
        Order_No: item.orderNo,
        Customer_Name: item.customerName,
        Barcode: item.barcode,
        SKU: item.sku,
        Brand: item.brand,
        MRP: item.mrp,
        Discount: item.discount,
        Net_Amount: item.netAmount,
        Cost_Price: item.costPrice,
        Profit_Loss: item.profitLoss,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ProfitLossReport");
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  const exportProduct = () => {
    exportToExcel(data, "ProfitLossReport");
  };

  return (
    <form onSubmit={formik.handleSubmit} className="mt-3">
      <div className="row g-3">
        {/* Store Field (Multiselect) */}
        <div className="col-12 col-md-6 col-lg-3">
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

        {/* Brands Field (Multiselect) */}
        <div className="col-12 col-md-6 col-lg-3">
          <label htmlFor="brands" className="form-label font-weight-500">
            Select Brand
          </label>
          <Select
            options={brandOptions}
            value={formik.values.brands}
            onChange={(options) =>
              formik.setFieldValue("brands", options || [])
            }
            onBlur={() => formik.setFieldTouched("brands", true)}
            placeholder="Select..."
            classNamePrefix="react-select"
            id="brands"
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

export default ProfitLossReportsForm;
