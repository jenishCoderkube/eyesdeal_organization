import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { toast } from "react-toastify";
import { reportService } from "../../../services/reportService";
import CommonButton from "../../../components/CommonButton/CommonButton";
const SalesReportsForm = ({ onSubmit }) => {
  // Options for select fields

  const [storeData, setStoreData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [brandData, setBrandData] = useState([]);

  const storeOptions = storeData?.map((vendor) => ({
    value: vendor._id,
    label: `${vendor.name}`,
  }));

  const brandOptions = brandData?.map((vendor) => ({
    value: vendor._id,
    label: `${vendor.name}`,
  }));

  useEffect(() => {
    getStores();
    getBrandData();
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

  const getBrandData = async () => {
    setLoading(true);
    try {
      const response = await reportService.getBrands();
      if (response.success) {
        setBrandData(response?.data?.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  // const getCategoryData = async () => {
  //   setLoading(true);
  //   try {
  //     const response = await reportService.getCategory();
  //     if (response.success) {
  //       console.log("res", response?.data?.data?.docs);
  //       setCategoryData(response?.data?.data?.docs);
  //     } else {
  //       toast.error(response.message);
  //     }
  //   } catch (error) {
  //     console.error("Login error:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // Formik setup without validation
  const formik = useFormik({
    initialValues: {
      store: null,
      brand: null,
      from: new Date(),
      to: new Date(),
    },
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="mt-3">
      <div className="row g-3">
        {/* Store Field */}
        <div className="col-12 col-md-6 col-lg-3">
          <label htmlFor="store" className="form-label font-weight-500">
            Select Store
          </label>
          <Select
            isMulti
            options={storeOptions}
            value={formik.values.store}
            onChange={(option) => formik.setFieldValue("store", option)}
            onBlur={() => formik.setFieldTouched("store", true)}
            placeholder="Select..."
            classNamePrefix="react-select"
            id="store"
          />
        </div>

        {/* Brand Field */}
        <div className="col-12 col-md-6 col-lg-3">
          <label htmlFor="brand" className="form-label font-weight-500">
            Select Brand
          </label>
          <Select
            isMulti
            options={brandOptions}
            value={formik.values.brand}
            onChange={(option) => formik.setFieldValue("brand", option)}
            onBlur={() => formik.setFieldTouched("brand", true)}
            placeholder="Select..."
            classNamePrefix="react-select"
            id="brand"
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
          <CommonButton
            loading={loading}
            buttonText="Submit"
            onClick={formik.handleSubmit}
            className="btn btn-primary w-auto bg-indigo-500 hover-bg-indigo-600 text-white"
          />
        </div>
      </div>
    </form>
  );
};

export default SalesReportsForm;
