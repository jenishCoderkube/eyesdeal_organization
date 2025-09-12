import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import Select from "react-select";
import DatePicker from "react-datepicker";
import * as XLSX from "xlsx";
import "react-datepicker/dist/react-datepicker.css";
import { reportService } from "../../../services/reportService";

const MODE_OPTIONS = [
  { value: "cash", label: "Cash" },
  { value: "bank", label: "UPI" },
  { value: "card", label: "Card" },
];

const TYPE_OPTIONS = [
  { value: "credit", label: "Credit(+)" },
  { value: "debit", label: "Debit(-)" },
];

const CashReportsForm = ({ onSubmit, data }) => {
  const [storeData, setStoreData] = useState([]);
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));

  const storeOptions = storeData?.map((store) => ({
    value: store._id,
    label: `${store.name}`,
  }));

  useEffect(() => {
    getStores();
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

  const formik = useFormik({
    initialValues: {
      mode: [
        { value: "cash", label: "Cash" },
        { value: "bank", label: "UPI" },
        { value: "card", label: "Card" },
      ],
      store: [],
      type: [{ value: "credit", label: "Credit(+)" }],
      from: new Date(),
      to: new Date(),
    },
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

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

  return (
    <form onSubmit={formik.handleSubmit} className="mt-3">
      <div className="row g-3">
        {/* Mode Field (Multiselect) */}
        <div className="col-12 col-md-6 col-lg-2">
          <label htmlFor="mode" className="form-label font-weight-500">
            Mode
          </label>
          <Select
            options={MODE_OPTIONS}
            value={formik.values.mode}
            onChange={(options) => formik.setFieldValue("mode", options || [])}
            onBlur={() => formik.setFieldTouched("mode", true)}
            placeholder="Select..."
            classNamePrefix="react-select"
            id="mode"
            isMulti
          />
        </div>

        <div className="col-12 col-md-6 col-lg-2">
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

        <div className="col-12 col-md-6 col-lg-2">
          <label htmlFor="type" className="form-label font-weight-500">
            Type
          </label>
          <Select
            options={TYPE_OPTIONS}
            value={formik.values.type}
            onChange={(options) => formik.setFieldValue("type", options || [])}
            onBlur={() => formik.setFieldTouched("type", true)}
            placeholder="Select..."
            classNamePrefix="react-select"
            id="type"
            isMulti
          />
        </div>

        <div className="col-12 col-md-6 col-lg-2">
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

        <div className="col-12 col-md-6 col-lg-2">
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

        <div className="col-12 d-flex gap-2 mt-3">
          <button className="btn btn-primary" type="submit" disabled={loading}>
            Submit
          </button>
        </div>
      </div>
    </form>
  );
};

export default CashReportsForm;
