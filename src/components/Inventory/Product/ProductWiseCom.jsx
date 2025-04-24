import React from "react";
import InventoryForm from "./InventoryForm";
import InventoryTable from "./InventoryTable";

const ProductWiseCom = () => {
  return (
    <div className="container-fluid px-4 py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-11">
          <div>
            <h1 className="h2 text-dark fw-bold">Product Wise Inventory</h1>
          </div>
          <div className="mt-5">
            <InventoryForm />
          </div>
          <div className="card shadow-none border p-0  mt-5">
            <h6 className="fw-bold px-3 pt-3">Inventory</h6>
            <InventoryTable />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductWiseCom;
