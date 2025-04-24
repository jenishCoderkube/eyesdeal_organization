import React from "react";
import StoreInventoryForm from "./StoreInventoryForm";
import StoreInventoryTable from "./StoreInventoryTable";

const StoretWiseCom = () => {
  return (
    <div className="container-fluid px-4 py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-11">
          <div>
            <h1 className="h2 text-dark fw-bold">Store wise inventory</h1>
          </div>
          <div className=" mt-5">
            <StoreInventoryForm />
          </div>
          {/* <div className="card shadow-none border p-0  mt-5">
            <h6 className="fw-bold px-3 pt-3">Inventory</h6>
            <StoreInventoryTable />
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default StoretWiseCom;
