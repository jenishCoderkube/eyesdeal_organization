import React, { useState } from "react";
import DashBoardCard from "../../../components/Dashboard/DashBoardCard";

const Dashboard = () => {
  return (
    <div className="p-5">
      <h3 className="ml-5 fw-bold">Dashboard</h3>
      <DashBoardCard />
    </div>
  );
};

export default Dashboard;
