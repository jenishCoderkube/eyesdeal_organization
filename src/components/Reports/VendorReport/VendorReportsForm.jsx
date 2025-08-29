import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import Select from "react-select";
import DatePicker from "react-datepicker";
import * as XLSX from "xlsx";
import "react-datepicker/dist/react-datepicker.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { reportService } from "../../../services/reportService";
import { purchaseService } from "../../../services/purchaseService";

const VendorReportsForm = ({ onSubmit, data, setstoresNames }) => {
  const [storeData, setStoreData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [vendorData, setVendorData] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));

  const storeOptions = storeData?.map((store) => ({
    value: store._id,
    label: `${store.name}`,
  }));

  const vendorOptions = vendorData?.map((vendor) => ({
    value: vendor._id,
    label: `${vendor.companyName}`,
  }));

  const statusOptions = [
    { value: "received", label: "Received" },
    { value: "damaged", label: "Damaged" },
    { value: "pending", label: "Pending" },
  ];

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
      const response = await purchaseService.getVendorsByType("lens_vendor");
      if (response.success) {
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

  const formik = useFormik({
    initialValues: {
      store: [],
      vendorName: [],
      status: [
        { value: "damaged", label: "Damaged" },
        { value: "received", label: "Received" },
      ],
      from: new Date(),
      to: new Date(),
    },
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  useEffect(() => {
    const ids = formik.values.store.map((s) => s.value);
    setstoresNames(ids);
  }, [formik.values.store]);

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

  return (
    <form onSubmit={formik.handleSubmit} className="mt-3">
      <div className="row g-3">
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
          <label htmlFor="vendorName" className="form-label font-weight-500">
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

        <div className="col-12 col-md-6 col-lg-2">
          <label htmlFor="status" className="form-label font-weight-500">
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

export default VendorReportsForm;
