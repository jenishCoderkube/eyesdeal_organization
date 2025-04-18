import React from "react";
import BrandInventoryTable from "./BrandInventoryTable";

const BrandGroupWiseCom = () => {
  return (
    <div className="container-fluid px-4 py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-11">
          <div
            className="card p-0  mt-5"
            style={{ border: "1px solid #e2e8f0" }}
          >
            <h6 className="fw-bold px-3 pt-3">Inventory</h6>
            <BrandInventoryTable />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandGroupWiseCom;
