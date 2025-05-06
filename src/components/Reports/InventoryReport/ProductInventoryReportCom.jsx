import React, { useEffect, useState } from "react";
import ProductInventoryReportsTable from "./ProductInventoryReportsTable";
import { reportService } from "../../../services/reportService";

const ProductInventoryReportCom = () => {
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    fetchInventoryReport({ page: 1, manageStock: true });
  }, []);

  const fetchInventoryReport = ({ page, manageStock }) => {
    const payload = {
      ...(page && { page }),
      manageStock
    };
    reportService.fetchInventoryReport(payload)
      .then(res => {
        setFilteredData(res.data?.data?.docs);
      })
      .catch(e => console.log("Failed to get orders: ", e))
  }

  return (
    <div className="max-width-95 mx-auto px-4 py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-11">
          <div>
            <h1 className="h2 text-dark fw-bold">Product Inventory Report</h1>
          </div>
          <div className="card shadow-none border p-0 mt-5">
            <h6 className="fw-bold px-3 pt-3">Product Inventory Report</h6>
            <ProductInventoryReportsTable data={filteredData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductInventoryReportCom;
