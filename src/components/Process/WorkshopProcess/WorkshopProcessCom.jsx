import React, { useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import InFittingTable from "./InFittingTable";
import InProcessTable from "./InProcessTable";
import NewOrderTable from "./NewOrderTable";
import ReadyTable from "./ReadyTable";

function WorkshopProcessCom() {
  const [selectedOption, setSelectedOption] = useState(null);
  const [activeStatus, setActiveStatus] = useState("New Order");

  const options = [
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "option3", label: "Option 3" },
    { value: "option4", label: "Option 4" },
    { value: "option5", label: "Option 5" },
    { value: "option6", label: "Option 6" },
    { value: "option7", label: "Option 7" },
    { value: "option8", label: "Option 8" },
  ];

  const statuses = ["New Order", "In Process", "In Fitting", "Ready"];

  return (
    <div className="mt-4 px-3">
      <div className="row g-1 align-items-end">
        <div className="col-12 col-md-6">
          <div className="row g-3 align-items-end">
            {/* Dropdown */}
            <div className="col-6">
              <label className="form-label">Stores</label>
              <Select
                options={options}
                value={selectedOption}
                onChange={setSelectedOption}
                isMulti
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </div>

            {/* Search */}
            <div className="col-6">
              <label className="form-label">Search</label>
              <input
                type="text"
                id="search"
                className="form-control"
                placeholder="Search..."
              />
            </div>
          </div>
        </div>
      </div>

      <button className="btn btn-primary mt-4">Submit</button>

      {/* Status Tabs */}
      <div className="overflow-x-auto mt-4">
        <div className="d-flex gap-3 pb-2" style={{ minWidth: "600px" }}>
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => setActiveStatus(status)}
              className={`bg-transparent border-0 pb-2 px-1 fw-medium 
                          ${
                            activeStatus === status
                              ? "text-primary border-bottom border-primary"
                              : "text-secondary"
                          } 
                          hover:text-dark focus:outline-none`}
              style={{ boxShadow: "none", outline: "none" }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Separator Line */}
      <div
        className="border-bottom"
        style={{ margin: "-9px 0px 33px 0px" }}
      ></div>

      {activeStatus === "New Order" ? (
        <NewOrderTable />
      ) : activeStatus === "In Process" ? (
        <InProcessTable />
      ) : activeStatus === "In Fitting" ? (
        <InFittingTable />
      ) : activeStatus === "Ready" ? (
        <ReadyTable />
      ) : (
        <></>
      )}
    </div>
  );
}

export default WorkshopProcessCom;
