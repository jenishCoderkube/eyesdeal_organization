import React, { useState } from "react";
import EmployeeIncentiveReportsForm from "./EmployeeIncentiveReportsForm";
import EmployeeIncentiveReportsTable from "./EmployeeIncentiveReportsTable";
import { reportService } from "../../../services/reportService";

const EmployeeIncentiveReportCom = () => {
  const [filteredData, setFilteredData] = useState([]);
  const [amountData, setAmountData] = useState([]);
  const [employeeids, setEmployeeids] = useState();
  const [fromDate, setFromDate] = useState();
  const [toDate, setToDate] = useState();

  const fetchOrdersWithFilter = ({ fromDate, toDate, salesRep }) => {
    reportService.getIncentiveData({ fromDate, toDate, salesRep })
      .then(res => {
        setFilteredData(res.data?.data?.docs);
      })
      .catch(e => console.log("Failed to get pruchaselog: ", e))
  }
  const fetchIncentiveAmount = ({ fromDate, toDate, salesRep }) => {
    reportService.getIncentiveAmount({ fromDate, toDate, salesRep })
      .then(res => {
        setAmountData(res.data?.data?.docs);
      })
      .catch(e => console.log("Failed to get incentive amount: ", e))
  }

  const handleFormSubmit = (values) => {
    const { from, to, employee = [] } = values;

    const fromTimestamp = new Date(from).getTime();
    const toTimestamp = new Date(to).getTime();

    const employeeIds = employee.value;

    if (employeeIds.length) {
      fetchOrdersWithFilter({
        fromDate: fromTimestamp,
        toDate: toTimestamp,
        salesRep: employeeIds,
      });
      fetchIncentiveAmount({
        fromDate: fromTimestamp,
        toDate: toTimestamp,
        salesRep: employeeIds,
      });
    }
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
              setEmployeeids={setEmployeeids}
              setFromDate={setFromDate}
              setToDate={setToDate}
            />
          </div>
          <div className="card shadow-none border p-0 mt-5">
            <h6 className="fw-bold px-3 pt-3">Incentive Report</h6>
            <EmployeeIncentiveReportsTable 
              data={filteredData} 
              amountData={amountData[0]?.totalIncentiveAmount} 
              employeeids={employeeids} 
              fromDate={fromDate} 
              toDate={toDate}/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeIncentiveReportCom;
