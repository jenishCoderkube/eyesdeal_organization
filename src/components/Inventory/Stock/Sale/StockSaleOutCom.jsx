import React from "react";
import StockSaleOutTable from "./StockSaleOutTable";

const StockSaleOutCom = () => {
  return (
    <div className="container-fluid px-4 py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-11">
          <div className="card p-0  mt-5">
            <h6 className="fw-bold px-3 pt-3">Stock Sale</h6>
            <StockSaleOutTable />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockSaleOutCom;
