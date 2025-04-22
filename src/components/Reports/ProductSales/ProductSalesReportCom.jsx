import React, { useState, useMemo } from "react";
import SalesReportsForm from "./SalesReportsForm";
import SalesReportsTable from "./SalesReportsTable";
import "bootstrap/dist/css/bootstrap.min.css";

const ProductSalesReportCom = () => {
  // Dummy data (5 entries)
  const initialData = useMemo(
    () => [
      {
        id: 1,
        store: "EYESDEAL BARDOLI",
        date: "22/04/2025",
        orderNo: "1954932",
        customerName: "SANYAM JHURANI",
        brand: "SeeLens spectacleLens",
        barcode: "52154",
        sku: "SV-BLUE-CUT UV 400 1.56 -6.00/-4.00",
        mrp: 1040,
        discount: 640,
        netAmount: 400,
      },
      {
        id: 2,
        store: "EYESDEAL BARDOLI",
        date: "22/04/2025",
        orderNo: "1954931",
        customerName: "TEJAS CHAUDHARY",
        brand: "I-Gog sunGlasses",
        barcode: "32090",
        sku: "I-GOG-SG-1450",
        mrp: 1450,
        discount: 750,
        netAmount: 700,
      },
      {
        id: 3,
        store: "CITY OPTICS",
        date: "23/04/2025",
        orderNo: "1954933",
        customerName: "ANITA SHARMA",
        brand: "Ray-Ban eyeGlasses",
        barcode: "12345",
        sku: "RB-FR-1001",
        mrp: 2000,
        discount: 500,
        netAmount: 1500,
      },
      {
        id: 4,
        store: "ELITE HOSPITAL",
        date: "21/04/2025",
        orderNo: "1954934",
        customerName: "RAHUL VERMA",
        brand: "Oakley sunGlasses",
        barcode: "67890",
        sku: "OK-SG-2002",
        mrp: 1800,
        discount: 300,
        netAmount: 1500,
      },
      {
        id: 5,
        store: "EYESDEAL BARDOLI",
        date: "22/04/2025",
        orderNo: "1954935",
        customerName: "PRIYA PATEL",
        brand: "Fizan eyeGlasses",
        barcode: "98765",
        sku: "FZ-FR-3003",
        mrp: 1200,
        discount: 200,
        netAmount: 1000,
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
        (!values.brand || item.brand === values.brand.value) &&
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
            <h1 className="h2 text-dark fw-bold">Product Sales Report</h1>
          </div>
          <div className="card border-0 mt-5">
            <SalesReportsForm onSubmit={handleFormSubmit} />
          </div>
          <div className="card p-0 mt-5">
            <h6 className="fw-bold px-3 pt-3">Product Report</h6>
            <SalesReportsTable data={filteredData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductSalesReportCom;
