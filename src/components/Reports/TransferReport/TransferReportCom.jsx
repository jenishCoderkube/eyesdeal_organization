import React, { useState, useMemo } from "react";
import TransferReportsForm from "./TransferReportsForm";
import TransferReportsTable from "./TransferReportsTable";

const TransferReportCom = () => {
  // Data from HTML <tbody> plus 3 dummy entries
  const initialData = useMemo(
    () => [
      {
        id: 1,
        date: "22/04/2025",
        fromStore: "EYESDEAL YOGICHOWK",
        toStore: "ED HO",
        sku: "FD-FR-081-C1",
        stockQuantity: 1,
      },
      {
        id: 54,
        date: "22/04/2025",
        fromStore: "EYESDEAL VESU",
        toStore: "EYESDEAL NAVSARI",
        sku: "FZ-FR-90050-C11",
        stockQuantity: 1,
      },
      {
        id: 2,
        date: "22/04/2025",
        fromStore: "EYESDEAL NAVSARI",
        toStore: "EYESDEAL YOGICHOWK",
        sku: "RB-FR-1001-C2",
        stockQuantity: 2,
      },
      {
        id: 3,
        date: "21/04/2025",
        fromStore: "ED HO",
        toStore: "EYESDEAL VESU",
        sku: "OK-SG-2002-C3",
        stockQuantity: 3,
      },
      {
        id: 4,
        date: "22/04/2025",
        fromStore: "EYESDEAL YOGICHOWK",
        toStore: "EYESDEAL NAVSARI",
        sku: "FZ-FR-3003-C4",
        stockQuantity: 1,
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
        (!values.storeFrom ||
          values.storeFrom.length === 0 ||
          values.storeFrom.some((s) => s.value === item.fromStore)) &&
        (!values.storeTo ||
          values.storeTo.length === 0 ||
          values.storeTo.some((s) => s.value === item.toStore)) &&
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
            <h1 className="h2 text-dark fw-bold">Transfer Report</h1>
          </div>
          <div className=" mt-5">
            <TransferReportsForm
              onSubmit={handleFormSubmit}
              data={filteredData}
            />
          </div>
          <div className="card shadow-none border p-0 mt-5">
            <h6 className="fw-bold px-3 pt-3">Transfer Report</h6>
            <TransferReportsTable data={filteredData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransferReportCom;
