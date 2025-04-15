import React from "react";
import SaleForm from "./SaleNewCom";
import HeaderTitle from "../../components/CommonTitle/HeaderTitle";

const AddSale = () => {
  return (
    <div>
      <div className="px-5">
        <HeaderTitle title="Add Sale" />
      </div>
      <SaleForm />
    </div>
  );
};

export default AddSale;
