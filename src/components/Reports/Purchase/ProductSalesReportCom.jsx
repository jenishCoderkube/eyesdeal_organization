import React, { useState, useMemo } from "react";
import PurchaseReportsForm from "./SalesReportsForm";
import PurchaseReportsTable from "./SalesReportsTable";

const PurchaseReportCom = () => {
  // Dummy data (5 entries)
  const initialData = useMemo(
    () => [
      {
        id: 1,
        store: "EYESDEAL BARDOLI",
        vendor: "Vision Suppliers",
        date: "22/04/2025",
        billNo: "BILL001",
        amount: 5000,
        totalPiece: 50,
      },
      {
        id: 2,
        store: "EYESDEAL BARDOLI",
        vendor: "Optic Distributors",
        date: "22/04/2025",
        billNo: "BILL002",
        amount: 3000,
        totalPiece: 30,
      },
      {
        id: 3,
        store: "CITY OPTICS",
        vendor: "Lens Crafters",
        date: "23/04/2025",
        billNo: "BILL003",
        amount: 4500,
        totalPiece: 45,
      },
      {
        id: 4,
        store: "ELITE HOSPITAL",
        vendor: "Vision Suppliers",
        date: "21/04/2025",
        billNo: "BILL004",
        amount: 6000,
        totalPiece: 60,
      },
      {
        id: 5,
        store: "EYESDEAL BARDOLI",
        vendor: "Optic Distributors",
        date: "22/04/2025",
        billNo: "BILL005",
        amount: 3500,
        totalPiece: 35,
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
        (!values.store || item.store === values.store.value) &&
        (!values.vendor || item.vendor === values.vendor.value) &&
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
            <h1 className="h2 text-dark fw-bold">Purchase Report</h1>
          </div>
          <div className=" mt-5">
            <PurchaseReportsForm onSubmit={handleFormSubmit} />
          </div>
          <div className="card shadow-none border p-0 mt-5">
            <h6 className="fw-bold px-3 pt-3">Purchase Report</h6>
            <PurchaseReportsTable data={filteredData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseReportCom;
