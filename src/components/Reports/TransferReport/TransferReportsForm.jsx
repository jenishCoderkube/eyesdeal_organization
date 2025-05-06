import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import Select from "react-select";
import DatePicker from "react-datepicker";
import * as XLSX from "xlsx";
import "react-datepicker/dist/react-datepicker.css";
import { reportService } from "../../../services/reportService";

const TransferReportsForm = ({ onSubmit, data, setFromDate, setToDate, setStoreFrom, setStoreTo, setFilteredData }) => {
  const [storeData, setStoreData] = useState([]);
  const [loading, setLoading] = useState(false);

  const storeOptions = storeData?.map((store) => ({
    value: store._id,
    label: `${store.name}`,
  }));

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

  const fetchTransferStockData = async ({ fromDate, toDate, page, storeFromid, storeToid }) => {
    setLoading(true);
    try {
      const payload = {
        fromDate,
        toDate,
        ...(page && { page }),
        ...(storeFromid && storeFromid.length && { storeFromid }),
        ...(storeToid && storeToid.length && { storeToid }),
      };
      const response = await reportService.getTransferStock(payload)
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
  }

  const formik = useFormik({
    initialValues: {
      storeFrom: [],
      storeTo: [],
      from: new Date(),
      to: new Date(),
    },
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  useEffect(() => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    getStores();

    const payload = {
      fromDate: yesterday.getTime(),
      toDate: today.getTime(),
      ...(formik.values.storeFrom?.length && { storeFromid: formik.values.storeFrom[0] }),
      ...(formik.values.storeTo?.length && { storeToid: formik.values.storeTo[0] }),
      page: 1,
    };
    fetchTransferStockData(payload);
  }, []);

  useEffect(() => {
    const fromTimestamp = new Date(formik.values.from).getTime();
    setFromDate(fromTimestamp);
  }, [formik.values.from]);

  useEffect(() => {
    const toTimestamp = new Date(formik.values.to).getTime();
    setToDate(toTimestamp);
  }, [formik.values.to]);

  useEffect(() => {
    const storeFrom = formik.values.storeFrom;
    setStoreFrom(storeFrom?.[0]);
  }, [formik.values.storeFrom]);

  useEffect(() => {
    const storeTo = formik.values.storeTo;
    setStoreTo(storeTo?.[0]);
  }, [formik.values.storeTo]);

  return (
    <form onSubmit={formik.handleSubmit} className="mt-3">
      <div className="row g-3">
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

export default TransferReportsForm;
