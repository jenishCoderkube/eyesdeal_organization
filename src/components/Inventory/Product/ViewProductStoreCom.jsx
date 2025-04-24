import React from "react";
import ViewProductForm from "./ViewProductForm";
import ViewProductTable from "./ViewProductTable";

const ViewProductStoreCom = () => {
  return (
    <div className="container-fluid px-4 py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-11">
          <div>
            <h1 className="h2 text-dark fw-bold">View Product Store</h1>
          </div>
          <div className="  mt-5">
            <ViewProductForm />
          </div>
          <div className="shadow-none border mt-5">
            <h6 className="fw-bold px-3 pt-3">Product Store</h6>
            <ViewProductTable />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProductStoreCom;
