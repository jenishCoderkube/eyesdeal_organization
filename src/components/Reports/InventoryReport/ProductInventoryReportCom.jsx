import React, { useMemo } from "react";
import ProductInventoryReportsTable from "./ProductInventoryReportsTable";

const ProductInventoryReportCom = () => {
  // Data from HTML <tr> plus 4 dummy entries
  const initialData = useMemo(
    () => [
      {
        id: 1,
        name: "Fizan Frames",
        sku: "FZ-FR-6075-C2-ATT",
        mrp: 1750,
        sellPrice: 1750,
        brand: "Fizan",
        barcode: "602487",
        stock: 0,
      },
      {
        id: 2,
        name: "Ray-Ban Sunglasses",
        sku: "RB-SG-1001-C3",
        mrp: 2500,
        sellPrice: 2200,
        brand: "Ray-Ban",
        barcode: "602488",
        stock: 5,
      },
      {
        id: 3,
        name: "Oakley Frames",
        sku: "OK-FR-2002-C1",
        mrp: 1800,
        sellPrice: 1600,
        brand: "Oakley",
        barcode: "602489",
        stock: 3,
      },
      {
        id: 4,
        name: "I-Gog EyeGlasses",
        sku: "IG-FR-KIDS-2306-C8",
        mrp: 870,
        sellPrice: 800,
        brand: "I-Gog",
        barcode: "602490",
        stock: 2,
      },
      {
        id: 5,
        name: "Fizan Sunglasses",
        sku: "FZ-SG-3003-C4",
        mrp: 2000,
        sellPrice: 1800,
        brand: "Fizan",
        barcode: "602491",
        stock: 1,
      },
    ],
    []
  );

  return (
    <div className="max-width-95 mx-auto px-4 py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-11">
          <div>
            <h1 className="h2 text-dark fw-bold">Product Inventory Report</h1>
          </div>
          <div className="card p-0 mt-5">
            <h6 className="fw-bold px-3 pt-3">Product Inventory Report</h6>
            <ProductInventoryReportsTable data={initialData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductInventoryReportCom;
