import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import Select from "react-select";
import DatePicker from "react-datepicker";
import * as XLSX from "xlsx";
import "react-datepicker/dist/react-datepicker.css";
import { reportService } from "../../../services/reportService";

const EmployeeIncentiveReportsForm = ({ onSubmit, data, setEmployeeids, setFromDate, setToDate }) => {
  const [employeeData, setEmployeeData] = useState([]);
  const [loading, setLoading] = useState(false);

  const employeeOptions = employeeData?.map((emp) => ({
    value: emp._id,
    label: `${emp.name}`,
  }));

  useEffect(() => {
    fetchEmployeeData();
  }, []);

  const fetchEmployeeData = async () => {
    setLoading(true);
    try {
      const role = ["sales", "store_manager", "individual_store"];
      const payload = {
        role,
        limit: 300
      };
      const response = await reportService.getEmployeeData(payload)
      if (response.success) {
        setEmployeeData(response?.data?.data?.docs);
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
      employee: [],
      from: new Date(),
      to: new Date(),
    },
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  useEffect(() => {
    const ids = formik.values.employee;    
    setEmployeeids(ids);
  }, [formik.values.employee]);

  useEffect(() => {
    const fromTimestamp = new Date(formik.values.from).getTime();
    setFromDate(fromTimestamp);
  }, [formik.values.from]);

  useEffect(() => {
    const toTimestamp = new Date(formik.values.to).getTime();
    setToDate(toTimestamp);
  }, [formik.values.to]);

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

  return (
    <form onSubmit={formik.handleSubmit} className="mt-3">
      <div className="row g-3">
        <div className="col-12 col-md-6 col-lg-4">
          <label htmlFor="employee" className="form-label font-weight-500">
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
          />
        </div>

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

export default EmployeeIncentiveReportsForm;
