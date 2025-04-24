import React, { useState, useMemo } from "react";
import ProductPurchaseReportsForm from "./ProductPurchaseReportsForm";
import ProductPurchaseReportsTable from "./ProductPurchaseReportsTable";

const ProductPurchaseReportCom = () => {
  // Dummy data (5 entries)
  const initialData = useMemo(
    () => [
      {
        id: 1,
        date: "22/04/2025",
        store: "EYESDEAL BARDOLI",
        vendor: "Vision Suppliers",
        barcode: "52154",
        billNo: "BILL001",
        sku: "SV-BLUE-CUT UV 400 1.56",
        quantity: 50,
        purchaseRate: 80,
        tax: 400,
        totalAmount: 4400,
      },
      {
        id: 2,
        date: "22/04/2025",
        store: "EYESDEAL BARDOLI",
        vendor: "Optic Distributors",
        barcode: "32090",
        billNo: "BILL002",
        sku: "I-GOG-SG-1450",
        quantity: 30,
        purchaseRate: 90,
        tax: 270,
        totalAmount: 2970,
      },
      {
        id: 3,
        date: "23/04/2025",
        store: "CITY OPTICS",
        vendor: "Lens Crafters",
        barcode: "12345",
        billNo: "BILL003",
        sku: "RB-FR-1001",
        quantity: 40,
        purchaseRate: 100,
        tax: 400,
        totalAmount: 4400,
      },
      {
        id: 4,
        date: "21/04/2025",
        store: "ELITE HOSPITAL",
        vendor: "Vision Suppliers",
        barcode: "67890",
        billNo: "BILL004",
        sku: "OK-SG-2002",
        quantity: 60,
        purchaseRate: 85,
        tax: 510,
        totalAmount: 5610,
      },
      {
        id: 5,
        date: "22/04/2025",
        store: "EYESDEAL BARDOLI",
        vendor: "Optic Distributors",
        barcode: "98765",
        billNo: "BILL005",
        sku: "FZ-FR-3003",
        quantity: 35,
        purchaseRate: 95,
        tax: 332.5,
        totalAmount: 3657.5,
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
            <h1 className="h2 text-dark fw-bold">Product Purchase Report</h1>
          </div>
          <div className=" mt-5">
            <ProductPurchaseReportsForm onSubmit={handleFormSubmit} />
          </div>
          <div className="card shadow-none border p-0 mt-5">
            <h6 className="fw-bold px-3 pt-3">Product Purchase Report</h6>
            <ProductPurchaseReportsTable data={filteredData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPurchaseReportCom;
