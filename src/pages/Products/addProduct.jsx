import React from "react";
import AddProductCom from "../../components/Products/AddProducts/AddProductCom";

const AddProduct = ({ mode = "add" }) => {
  return (
    <div>
      <AddProductCom mode={mode} />
    </div>
  );
};

export default AddProduct;
