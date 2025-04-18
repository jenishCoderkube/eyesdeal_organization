import React from "react";
import HeaderTitle from "../../../CommonTitle/HeaderTitle";
import StockSaleForm from "./StockSaleForm";

function StockSaleCom() {
  return (
    <div>
      <div className="px-5">
        <HeaderTitle title="Add Stock Sale" />
      </div>
      <StockSaleForm />
    </div>
  );
}

export default StockSaleCom;
