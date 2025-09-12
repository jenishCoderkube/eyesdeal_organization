import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import Select from "react-select";
import DatePicker from "react-datepicker";
import * as XLSX from "xlsx";
import "react-datepicker/dist/react-datepicker.css";
import { reportService } from "../../../services/reportService";

const StockAdjustmentReportsForm = ({
  onSubmit,
  data,
  setFilteredData,
  setStoresIdsData,
}) => {
  const [storeData, setStoreData] = useState([]);
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));

  const storeOptions = storeData?.map((store) => ({
    value: store._id,
    label: `${store.name}`,
  }));

  useEffect(() => {
    getStores();
    fetchStockReport();
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

  const fetchStockReport = async () => {
    setLoading(true);
    try {
      const response = await reportService.getStockReport();
      if (response.success) {
        setFilteredData(response?.data?.data?.docs);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      store: [],
      from: new Date(),
      to: new Date(),
    },
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  useEffect(() => {
    const ids = formik.values.store;
    setStoresIdsData(ids);
  }, [formik.values.store]);

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

  const exportToExcel = (data, filename) => {
    const worksheet = XLSX.utils.json_to_sheet(
      data.map((item) => ({
        SRNO: item.id,
        Date: item.date,
        Store_Name: item.store,
        Barcode: item.barcode,
        SKU: item.sku,
        Old_Stock: item.oldStock,
        New_Stock: item.newStock,
        Reason: item.reason,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "StockAdjustmentReport");
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  return (
    <form onSubmit={formik.handleSubmit} className="mt-3">
      <div className="row g-3">
        <div className="col-12 col-md-4">
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

        <div className="col-12 col-md-4">
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

        <div className="col-12 col-md-4">
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

export default StockAdjustmentReportsForm;
