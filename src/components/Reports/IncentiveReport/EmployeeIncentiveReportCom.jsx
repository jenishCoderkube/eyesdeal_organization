import React, { useState, useMemo } from "react";
import EmployeeIncentiveReportsForm from "./EmployeeIncentiveReportsForm";
import EmployeeIncentiveReportsTable from "./EmployeeIncentiveReportsTable";

const EmployeeIncentiveReportCom = () => {
  // Dummy data (5 entries)
  const initialData = useMemo(
    () => [
      {
        id: 1,
        employee: "HIRAL JAIN",
        date: "22/04/2025",
        orderNo: "ORD001",
        brand: "RAY-BAN",
        sku: "RB-FR-1001",
        mrp: 5000,
        discount: 1000,
        percentage: 5,
        incentiveAmount: 200,
      },
      {
        id: 2,
        employee: "RAJESH PATEL",
        date: "22/04/2025",
        orderNo: "ORD002",
        brand: "OAKLEY",
        sku: "OK-SG-2002",
        mrp: 6000,
        discount: 1200,
        percentage: 4,
        incentiveAmount: 240,
      },
      {
        id: 3,
        employee: "SNEHA SHARMA",
        date: "23/04/2025",
        orderNo: "ORD003",
        brand: "FOSSIL",
        sku: "FZ-FR-3003",
        mrp: 4500,
        discount: 900,
        percentage: 6,
        incentiveAmount: 270,
      },
      {
        id: 4,
        employee: "HIRAL JAIN",
        date: "21/04/2025",
        orderNo: "ORD004",
        brand: "RAY-BAN",
        sku: "RB-SG-1002",
        mrp: 7000,
        discount: 1400,
        percentage: 5,
        incentiveAmount: 350,
      },
      {
        id: 5,
        employee: "RAJESH PATEL",
        date: "22/04/2025",
        orderNo: "ORD005",
        brand: "OAKLEY",
        sku: "OK-FR-2003",
        mrp: 5500,
        discount: 1100,
        percentage: 4,
        incentiveAmount: 220,
      },
    ],
    []
  );

  const [filteredData, setFilteredData] = useState(initialData);

  const handleFormSubmit = (values) => {
    const filtered = initialData.filter((item) => {
      const itemDate = new Date(item.date.split("/").reverse().join("-"));
      const fromDate = values.from;
      const toDate = values.to;
      return (
        (!values.employee ||
          values.employee.length === 0 ||
          values.employee.some((e) => e.value === item.employee)) &&
        (!fromDate || itemDate >= fromDate) &&
        (!toDate || itemDate <= toDate)
      );
    });
    setFilteredData(filtered);
  };

  return (
    <div className="max-width-95 mx-auto px-4 py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-11">
          <div>
            <h1 className="h2 text-dark fw-bold">Employee Incentive Report</h1>
          </div>
          <div className=" mt-5">
            <EmployeeIncentiveReportsForm
              onSubmit={handleFormSubmit}
              data={filteredData}
            />
          </div>
          <div className="card shadow-none border p-0 mt-5">
            <h6 className="fw-bold px-3 pt-3">Incentive Report</h6>
            <EmployeeIncentiveReportsTable data={filteredData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeIncentiveReportCom;
