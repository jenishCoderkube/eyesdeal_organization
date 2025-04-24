import React, { useState, useMemo } from "react";
import GstReportsForm from "./GstReportsForm";
import GstReportsTable from "./GstReportsTable";

const GstReportCom = () => {
  // Data from HTML <tbody> plus 3 dummy entries
  const initialData = useMemo(
    () => [
      {
        id: 1,
        date: "22/04/2025",
        orderNo: "2254946",
        sku: "IG-FR-KIDS-2306-C8",
        item: "I-Gog eyeGlasses",
        godown: "EYESDEAL BHARUCH",
        qty: 2,
        rate: 446.43,
        cgst: 26.79,
        sgst: 26.79,
        netAmount: 500,
        narration:
          "EYESDEAL BHARUCH-JIGNESHA P. PATEL-2254946-IG-FR-KIDS-2306-C8",
        cash: 3300,
        upi: 0,
        card: 0,
      },
      {
        id: 26,
        date: "22/04/2025",
        orderNo: "1954931",
        sku: "I-GOG-SG-1450",
        item: "I-Gog sunGlasses",
        godown: "EYESDEAL BARDOLI",
        qty: 1,
        rate: 593.22,
        cgst: 53.39,
        sgst: 53.39,
        netAmount: 700,
        narration: "EYESDEAL BARDOLI-TEJAS CHAUDHARY-1954931-I-GOG-SG-1450",
        cash: 0,
        upi: 700,
        card: 0,
      },
      {
        id: 2,
        date: "21/04/2025",
        orderNo: "2254947",
        sku: "RB-FR-1001-C2",
        item: "Ray-Ban eyeGlasses",
        godown: "EYESDEAL BHARUCH",
        qty: 1,
        rate: 714.29,
        cgst: 42.86,
        sgst: 42.86,
        netAmount: 800,
        narration: "EYESDEAL BHARUCH-RAHUL SHARMA-2254947-RB-FR-1001-C2",
        cash: 0,
        upi: 0,
        card: 800,
      },
      {
        id: 3,
        date: "22/04/2025",
        orderNo: "1954932",
        sku: "OK-SG-2002-C3",
        item: "Oakley sunGlasses",
        godown: "EYESDEAL BARDOLI",
        qty: 2,
        rate: 535.71,
        cgst: 32.14,
        sgst: 32.14,
        netAmount: 1200,
        narration: "EYESDEAL BARDOLI-PRIYA DESAI-1954932-OK-SG-2002-C3",
        cash: 1200,
        upi: 0,
        card: 0,
      },
      {
        id: 4,
        date: "20/04/2025",
        orderNo: "2254948",
        sku: "IG-FR-ADULT-3003-C4",
        item: "I-Gog eyeGlasses",
        godown: "EYESDEAL BHARUCH",
        qty: 1,
        rate: 625.0,
        cgst: 37.5,
        sgst: 37.5,
        netAmount: 700,
        narration: "EYESDEAL BHARUCH-AMIT PATEL-2254948-IG-FR-ADULT-3003-C4",
        cash: 0,
        upi: 700,
        card: 0,
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
          values.store.some((s) => s.value === item.godown)) &&
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
            <h1 className="h2 text-dark fw-bold">Gst Report</h1>
          </div>
          <div className=" mt-5">
            <GstReportsForm onSubmit={handleFormSubmit} data={filteredData} />
          </div>
          <div className="card shadow-none border p-0 mt-5">
            <h6 className="fw-bold px-3 pt-3">Gst Report</h6>
            <GstReportsTable data={filteredData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GstReportCom;
