import React, { useState, useMemo } from "react";
import ProfitLossReportsForm from "./ProfitLossReportsForm";
import ProfitLossReportsTable from "./ProfitLossReportsTable";

const ProfitLossReportCom = () => {
  // Data from HTML <tbody> plus 3 dummy entries
  const initialData = useMemo(
    () => [
      {
        id: 1,
        store: "EYESDEAL BHARUCH",
        date: "22/04/2025",
        orderNo: "2254946",
        customerName: "JIGNESHA P. PATEL",
        barcode: "616573",
        sku: "IG-FR-KIDS-2306-C8",
        brand: "I-Gog eyeGlasses",
        mrp: 870,
        discount: 370,
        netAmount: 500,
        costPrice: 160,
        profitLoss: 340,
      },
      {
        id: 26,
        store: "EYESDEAL BARDOLI",
        date: "22/04/2025",
        orderNo: "1954931",
        customerName: "TEJAS CHAUDHARY",
        barcode: "32090",
        sku: "I-GOG-SG-1450",
        brand: "I-Gog sunGlasses",
        mrp: 1450,
        discount: 750,
        netAmount: 700,
        costPrice: 250,
        profitLoss: 450,
      },
      {
        id: 2,
        store: "EYESDEAL BHARUCH",
        date: "21/04/2025",
        orderNo: "2254947",
        customerName: "RAHUL SHARMA",
        barcode: "616574",
        sku: "RB-FR-1001-C2",
        brand: "Ray-Ban",
        mrp: 1200,
        discount: 400,
        netAmount: 800,
        costPrice: 300,
        profitLoss: 500,
      },
      {
        id: 3,
        store: "EYESDEAL BARDOLI",
        date: "22/04/2025",
        orderNo: "1954932",
        customerName: "PRIYA DESAI",
        barcode: "32091",
        sku: "OK-SG-2002-C3",
        brand: "Oakley",
        mrp: 1800,
        discount: 600,
        netAmount: 1200,
        costPrice: 400,
        profitLoss: 800,
      },
      {
        id: 4,
        store: "EYESDEAL BHARUCH",
        date: "20/04/2025",
        orderNo: "2254948",
        customerName: "AMIT PATEL",
        barcode: "616575",
        sku: "IG-FR-ADULT-3003-C4",
        brand: "I-Gog eyeGlasses",
        mrp: 950,
        discount: 250,
        netAmount: 700,
        costPrice: 200,
        profitLoss: 500,
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
        (!values.brands ||
          values.brands.length === 0 ||
          values.brands.some((b) => b.value === item.brand)) &&
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
            <h1 className="h2 text-dark fw-bold">Profit Loss Report</h1>
          </div>
          <div className="mt-5">
            <ProfitLossReportsForm
              onSubmit={handleFormSubmit}
              data={filteredData}
            />
          </div>
          <div className="card shadow-none border p-0 mt-5">
            <h6 className="fw-bold px-3 pt-3">Profit Loss Report</h6>
            <ProfitLossReportsTable data={filteredData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfitLossReportCom;
