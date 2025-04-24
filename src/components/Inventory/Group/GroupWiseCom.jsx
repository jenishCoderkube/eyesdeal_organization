import React from "react";
import GroupInventoryForm from "./GroupInventoryForm";
import GroupInventoryTable from "./GroupInventoryTable";

const GroupWiseCom = () => {
  return (
    <div className="container-fluid px-4 py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-11">
          <div>
            <h1 className="h2 text-dark fw-bold">Group wise inventory</h1>
          </div>
          <div className=" mt-5">
            <GroupInventoryForm />
          </div>
          <div
            className="card shadow-none border p-0  mt-5"
            style={{ border: "1px solid #e2e8f0" }}
          >
            <h6 className="fw-bold px-3 pt-3">Inventory</h6>
            <GroupInventoryTable />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupWiseCom;
