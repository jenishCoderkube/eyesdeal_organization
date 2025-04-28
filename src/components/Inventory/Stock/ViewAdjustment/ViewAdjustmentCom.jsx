import React from "react";
import ViewAdjustmentForm from "./ViewAdjustmentForm";
import ViewAdjustmentTable from "./ViewAdjustmentTable";

const ViewAdjustmentCom = () => {
  return (
    <div className="container-fluid px-4 py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-11">
          <div>
            <h1 className="h2 text-dark fw-bold">View Adjustment</h1>
          </div>
          <div className="  mt-5">
            <ViewAdjustmentForm />
          </div>
          {/* <div
            className="shadow-none border mt-5"
            style={{ border: "1px solid #e2e8f0" }}
          >
            <h6 className="fw-bold px-3 pt-3">Adjustment</h6>
            <ViewAdjustmentTable />
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default ViewAdjustmentCom;
