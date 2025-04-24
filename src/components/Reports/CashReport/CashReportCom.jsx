import React, { useState, useMemo } from "react";
import CashReportsForm from "./CashReportsForm";
import CashReportsTable from "./CashReportsTable";

const CashReportCom = () => {
  // Data from HTML <tbody>
  const initialData = useMemo(
    () => [
      {
        id: 1,
        date: "22/04/2025",
        store: "EYESDEAL BHAGATALAV",
        mode: "cash",
        expenseCategory: "SALE",
        type: "credit",
        amount: 1300,
        note: "2054942",
      },
      {
        id: 2,
        date: "22/04/2025",
        store: "EYESDEAL VARACCHA",
        mode: "cash",
        expenseCategory: "SALE",
        type: "credit",
        amount: 1000,
        note: "854940",
      },
      {
        id: 3,
        date: "22/04/2025",
        store: "EYESDEAL ADAJAN",
        mode: "cash",
        expenseCategory: "SALE",
        type: "credit",
        amount: 1450,
        note: "2437418",
      },
      {
        id: 4,
        date: "22/04/2025",
        store: "EYESDEAL VARACCHA",
        mode: "cash",
        expenseCategory: "SALE",
        type: "credit",
        amount: 800,
        note: "854661",
      },
      {
        id: 5,
        date: "22/04/2025",
        store: "EYESDEAL BHATAR",
        mode: "cash",
        expenseCategory: "OLD ERP DELIVERY ( +CREDIT )",
        type: "credit",
        amount: 1800,
        note: "NEMISH BHAI KAPADIA OLD DLV OLD ERP",
      },
      {
        id: 6,
        date: "22/04/2025",
        store: "EYESDEAL BHATAR",
        mode: "cash",
        expenseCategory: "SALE",
        type: "credit",
        amount: 1400,
        note: "207649",
      },
      {
        id: 7,
        date: "22/04/2025",
        store: "EYESDEAL KATARGAM",
        mode: "cash",
        expenseCategory: "SALE",
        type: "credit",
        amount: 800,
        note: "454936",
      },
      {
        id: 8,
        date: "22/04/2025",
        store: "EYESDEAL PANCHBATTI BHARUCH",
        mode: "cash",
        expenseCategory: "SALE",
        type: "credit",
        amount: 1050,
        note: "1454935",
      },
      {
        id: 9,
        date: "22/04/2025",
        store: "EYESDEAL KATARGAM",
        mode: "cash",
        expenseCategory: "SALE",
        type: "credit",
        amount: 500,
        note: "454934",
      },
      {
        id: 10,
        date: "22/04/2025",
        store: "EYESDEAL BARDOLI",
        mode: "cash",
        expenseCategory: "SALE",
        type: "credit",
        amount: 400,
        note: "1954932",
      },
      {
        id: 11,
        date: "22/04/2025",
        store: "EYESDEAL PALANPUR",
        mode: "bank",
        expenseCategory: "SALE",
        type: "credit",
        amount: 2500,
        note: "1654941",
      },
      {
        id: 12,
        date: "22/04/2025",
        store: "EYESDEAL PALANPUR",
        mode: "bank",
        expenseCategory: "SALE",
        type: "credit",
        amount: 1100,
        note: "1654937",
      },
      {
        id: 13,
        date: "22/04/2025",
        store: "EYESDEAL BARDOLI",
        mode: "bank",
        expenseCategory: "SALE",
        type: "credit",
        amount: 700,
        note: "1954931",
      },
      {
        id: 14,
        date: "22/04/2025",
        store: "EYESDEAL NAVSARI",
        mode: "card",
        expenseCategory: "SALE",
        type: "credit",
        amount: 7500,
        note: "354939",
      },
      {
        id: 15,
        date: "22/04/2025",
        store: "EYESDEAL BHATAR",
        mode: "card",
        expenseCategory: "SALE",
        type: "credit",
        amount: 4400,
        note: "251997",
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
        (!values.mode ||
          values.mode.length === 0 ||
          values.mode.some((m) => m.value === item.mode)) &&
        (!values.store ||
          values.store.length === 0 ||
          values.store.some((s) => s.value === item.store)) &&
        (!values.type ||
          values.type.length === 0 ||
          values.type.some((t) => t.value === item.type)) &&
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
            <h1 className="h2 text-dark fw-bold">Cash Report</h1>
          </div>
          <div className=" mt-5">
            <CashReportsForm onSubmit={handleFormSubmit} data={filteredData} />
          </div>
          <div className="card shadow-none border p-0 mt-5">
            <h6 className="fw-bold px-3 pt-3">Cashbook Report</h6>
            <CashReportsTable data={filteredData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashReportCom;
