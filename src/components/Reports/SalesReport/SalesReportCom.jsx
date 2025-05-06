import React, { useState, useEffect } from "react";
import SalesReportsForm from "./SalesReportsForm";
import SalesReportsTable from "./SalesReportsTable";
import { reportService } from "../../../services/reportService";

const SalesReportCom = () => {
  const [filteredData, setFilteredData] = useState([]);
  const [amountData, setAmountData] = useState([]);

  useEffect(() => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    fetchSalesData({ page: 1, fromDate: yesterday.getTime(), toDate: today.getTime() });
    fetchAmount({ fromDate: yesterday.getTime(), toDate: today.getTime() });
  }, []);

  const fetchSalesData = ({ page, fromDate, toDate }) => {
    const payload = {
      ...(page !== undefined && { page }),
      fromDate,
      toDate
    };
    reportService.getSalesData(payload)
      .then(res => {
        setFilteredData(res.data?.data?.docs);
      })
      .catch(e => console.log("Failed to get pruchaselog: ", e))
  }

  const fetchSalesDataWithFilter = ({ fromDate, toDate, stores }) => {
    reportService.getSalesData({ fromDate, toDate, stores })
      .then(res => {
        setFilteredData(res.data?.data?.docs);
      })
      .catch(e => console.log("Failed to get pruchaselog: ", e))
  }

  const fetchAmount = (dateFrom, dateTo) => {
    reportService.getAmount(dateFrom, dateTo)
      .then(res => {
        setAmountData(res.data?.data?.docs);
      })
      .catch(e => console.log("Failed to get amount: ", e))
  }

  const fetchAmountWithFilter = ({ fromDate, toDate, stores }) => {
    reportService.getAmount({ fromDate, toDate, stores })
      .then(res => {
        setAmountData(res.data?.data?.docs);
      })
      .catch(e => console.log("Failed to get pruchaselog: ", e))
  }

  const handleFormSubmit = (values) => {
    if (values) {
      const { from, to, store = [] } = values;

      const fromTimestamp = new Date(from).getTime();
      const toTimestamp = new Date(to).getTime();

      const storeIds = store.map(s => s.value);

      if (storeIds.length) {
        fetchSalesDataWithFilter({
          fromDate: fromTimestamp,
          toDate: toTimestamp,
          stores: storeIds,
        });
        fetchAmountWithFilter({
          fromDate: fromTimestamp,
          toDate: toTimestamp,
          stores: storeIds,
        });
      } else {
        fetchSalesData({ fromDate: fromTimestamp, toDate: toTimestamp });
        fetchAmount({ fromDate: fromTimestamp, toDate: toTimestamp });
      }
    }
  };

  return (
    <div className="max-width-95 mx-auto px-4 py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-11">
          <div>
            <h1 className="h2 text-dark fw-bold">Sales Report</h1>
          </div>
          <div className=" mt-5">
            <SalesReportsForm onSubmit={handleFormSubmit} data={filteredData} />
          </div>
          <div className="card shadow-none border p-0 mt-5">
            <h6 className="fw-bold px-3 pt-3">Sales Report</h6>
            <SalesReportsTable data={filteredData} amountData={amountData[0]?.totalAmount} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesReportCom;
