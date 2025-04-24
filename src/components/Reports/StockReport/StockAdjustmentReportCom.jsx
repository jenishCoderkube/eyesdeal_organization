import React, { useState, useMemo } from "react";
import StockAdjustmentReportsForm from "./StockAdjustmentReportsForm";
import StockAdjustmentReportsTable from "./StockAdjustmentReportsTable";

const StockAdjustmentReportCom = () => {
  // Data from HTML <tr> plus 4 dummy entries
  const initialData = useMemo(
    () => [
      {
        id: 1,
        date: "22/04/2025",
        store: "EYESDEAL PALANPUR",
        barcode: "2021790",
        sku: "FZ-FR-IP12099-C6",
        oldStock: 0,
        newStock: 1,
        reason: "Product More than Actual",
      },
      {
        id: 2,
        date: "22/04/2025",
        store: "EYESDEAL NAVSARI",
        barcode: "2021791",
        sku: "RB-FR-1001-C2",
        oldStock: 2,
        newStock: 1,
        reason: "Product Less than Actual",
      },
      {
        id: 3,
        date: "21/04/2025",
        store: "EYESDEAL VESU",
        barcode: "2021792",
        sku: "OK-SG-2002-C3",
        oldStock: 1,
        newStock: 3,
        reason: "Stock Correction",
      },
      {
        id: 4,
        date: "22/04/2025",
        store: "EYESDEAL YOGICHOWK",
        barcode: "2021793",
        sku: "FZ-FR-3003-C4",
        oldStock: 0,
        newStock: 2,
        reason: "Damaged Product Adjustment",
      },
      {
        id: 5,
        date: "20/04/2025",
        store: "EYESDEAL PALANPUR",
        barcode: "2021794",
        sku: "FD-FR-081-C1",
        oldStock: 3,
        newStock: 2,
        reason: "Inventory Audit",
      },
    ],
    []
  );

  const [filteredData, setFilteredData] = useState(initialData);

  const handleFormSubmit = (values) => {
    const filtered = initialData.filter((item) => {
      const itemDate = new Date(item.date.split("/").reverse().join("-"));
      const fromDate = values.from;
      const toDate = values.to;
      return (
        (!values.store ||
          values.store.length === 0 ||
          values.store.some((s) => s.value === item.store)) &&
        (!fromDate || itemDate >= fromDate) &&
        (!toDate || itemDate <= toDate)
      );
    });
    setFilteredData(filtered);
  };

  return (
    <div className="max-width-95 mx-auto px-4 py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-11">
          <div>
            <h1 className="h2 text-dark fw-bold">Stock Adjustment Report</h1>
          </div>
          <div className=" mt-5">
            <StockAdjustmentReportsForm
              onSubmit={handleFormSubmit}
              data={filteredData}
            />
          </div>
          <div className="card shadow-none border p-0 mt-5">
            <h6 className="fw-bold px-3 pt-3">Adjustment Report</h6>
            <StockAdjustmentReportsTable data={filteredData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockAdjustmentReportCom;
