import React, { useEffect, useState } from "react";
import axios from "axios";
import { Alert } from "react-bootstrap";

const Dashboard = () => {
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const response = await axios.get(
          "https://devnode.coderkubes.com/eyesdeal-api/master/feature",
          {
            headers: {
              Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MzhiMWEwNzlmNjdhNjNlYTFlMWJhMDEiLCJuYW1lIjoiUml6d2FuIiwicGhvbmUiOiI5MTc3Nzc5MDA5MTAiLCJyb2xlIjoiYWRtaW4iLCJzdG9yZXMiOltdLCJpYXQiOjE3NDUyMzI2ODMsImV4cCI6MTc0NTI3NTg4M30.0H7Hx4-zxWc58wYoQVvXtSxIZMCCVLBYhF76BkodKNE`,
            },
          }
        );
        console.log("Feature values:", response.data);
        ``;
        setError(null);
      } catch (error) {
        console.error("Error fetching features:", error);
        if (error.response) {
          setError(
            `API error: ${error.response.status} - ${
              error.response.data.message || "Unknown error"
            }`
          );
        } else if (error.request) {
          setError(
            "CORS or network error: Unable to reach the server. Please check your network or contact the administrator."
          );
        } else {
          setError(`Error: ${error.message}`);
        }
      }
    };

    fetchFeatures();
  }, []); // Empty dependency array to run once on mount

  return (
    <div className="p-5">
      <h3 className="ml-5 fw-bold">Dashboard</h3>
      {error && (
        <Alert
          variant="danger"
          className="mt-3 ml-5"
          style={{ maxWidth: "600px" }}
        >
          {error}
        </Alert>
      )}
    </div>
  );
};

export default Dashboard;
