import React, { useEffect, useState } from "react";
import axios from "axios";
import { Alert } from "react-bootstrap";

const Dashboard = () => {
  const [error, setError] = useState(null);

  return (
    <div className="p-5">
      <h3 className="ml-5 fw-bold">Dashboard</h3>
    </div>
  );
};

export default Dashboard;
