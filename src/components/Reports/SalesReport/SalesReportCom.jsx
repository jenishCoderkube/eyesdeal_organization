import React, { useState, useMemo } from "react";
import SalesReportsForm from "./SalesReportsForm";
import SalesReportsTable from "./SalesReportsTable";

const SalesReportCom = () => {
  // Dummy data (10 entries from HTML)
  const initialData = useMemo(
    () => [
      {
        id: 1,
        store: "EYESDEAL VARACCHA",
        customerName: "BHARAT BHAI SORATHIYA",
        salesmanName: "VIJAY SHIYANI",
        date: "22/04/2025",
        billNo: "854940",
        totalAmount: 1200,
        pendingAmount: 200,
      },
      {
        id: 2,
        store: "EYESDEAL NAVSARI",
        customerName: "RIKEN",
        salesmanName: "DIVYESH AHIR",
        date: "22/04/2025",
        billNo: "354939",
        totalAmount: 7500,
        pendingAmount: 0,
      },
      {
        id: 3,
        store: "EYESDEAL KAMREJ",
        customerName: "BHAVNABEN PANCHAL",
        salesmanName: "MOHIT SHAH",
        date: "22/04/2025",
        billNo: "1554938",
        totalAmount: 300,
        pendingAmount: 300,
      },
      {
        id: 4,
        store: "EYESDEAL PALANPUR",
        customerName: "RUDRA SINGH THAKUR",
        salesmanName: "ASIF SAIYED",
        date: "22/04/2025",
        billNo: "1654937",
        totalAmount: 1100,
        pendingAmount: 0,
      },
      {
        id: 5,
        store: "EYESDEAL KATARGAM",
        customerName: "UMANG PATEL",
        salesmanName: "ABDUL BARI",
        date: "22/04/2025",
        billNo: "454936",
        totalAmount: 800,
        pendingAmount: 0,
      },
      {
        id: 6,
        store: "EYESDEAL PANCHBATTI BHARUCH",
        customerName: "PANKAJ MAKVANA",
        salesmanName: "ARAFAT LAKHA",
        date: "22/04/2025",
        billNo: "1454935",
        totalAmount: 1050,
        pendingAmount: 0,
      },
      {
        id: 7,
        store: "EYESDEAL KATARGAM",
        customerName: "RAJESH PANDIYA",
        salesmanName: "ABDUL BARI",
        date: "22/04/2025",
        billNo: "454934",
        totalAmount: 500,
        pendingAmount: 0,
      },
      {
        id: 8,
        store: "EYESDEAL BARDOLI",
        customerName: "LATIKABEN KANJANI",
        salesmanName: "MONALI LAGDHIR",
        date: "22/04/2025",
        billNo: "1954933",
        totalAmount: 600,
        pendingAmount: 600,
      },
      {
        id: 9,
        store: "EYESDEAL BARDOLI",
        customerName: "SANYAM JHURANI",
        salesmanName: "MONALI LAGDHIR",
        date: "22/04/2025",
        billNo: "1954932",
        totalAmount: 400,
        pendingAmount: 0,
      },
      {
        id: 10,
        store: "EYESDEAL BARDOLI",
        customerName: "TEJAS CHAUDHARY",
        salesmanName: "BHARAT LAGDHIR",
        date: "22/04/2025",
        billNo: "1954931",
        totalAmount: 700,
        pendingAmount: 0,
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
            <h1 className="h2 text-dark fw-bold">Sales Report</h1>
          </div>
          <div className=" mt-5">
            <SalesReportsForm onSubmit={handleFormSubmit} data={filteredData} />
          </div>
          <div className="card shadow-none border p-0 mt-5">
            <h6 className="fw-bold px-3 pt-3">Sales Report</h6>
            <SalesReportsTable data={filteredData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesReportCom;
