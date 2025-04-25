import React, { useEffect, useState } from "react";
import SalesReportsForm from "./SalesReportsForm";
import SalesReportsTable from "./SalesReportsTable";
import "bootstrap/dist/css/bootstrap.min.css";
import { reportService } from "../../../services/reportService";

const ProductSalesReportCom = () => {

  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    // Get yesterday's date
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    fetchOrders(currentPage, yesterday.getTime(), today.getTime());
  }, []);

  const fetchOrders = (page, dateFrom, dateTo) => {
    reportService.getOrders(page, dateFrom, dateTo)
    .then(res => {
      setFilteredData(res.data?.data?.docs);
    })
    .catch(e => console.log("Failed to get orders: ", e))
  }

  const handleFormSubmit = (values) => {
    if (values) {
      const { startDate, endDate, page = 1 } = values;
      fetchOrders(page, startDate, endDate);
      setCurrentPage(page);
    }
  };

  return (
    <div className="max-width-95 mx-auto px-4 py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-11">
          <div>
            <h1 className="h2 text-dark fw-bold">Product Sales Report</h1>
          </div>
          <div className=" mt-5">
            <SalesReportsForm onSubmit={handleFormSubmit} />
          </div>
          <div className="card shadow-none border p-0 mt-5">
            <h6 className="fw-bold px-3 pt-3">Product Report</h6>
            <SalesReportsTable data={filteredData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductSalesReportCom;
