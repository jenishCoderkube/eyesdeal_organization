import React from "react";
import StockSaleInTable from "./StockSaleInTable";

const StockSaleInCom = () => {
  return (
    <div className="container-fluid px-4 py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-11">
          <div className="card p-0  mt-5">
            <h6 className="fw-bold px-3 pt-3">Receive Stock Sale</h6>
            <StockSaleInTable />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockSaleInCom;
