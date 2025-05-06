import React, { useState, useEffect } from "react";
import PurchaseReportsForm from "./SalesReportsForm";
import PurchaseReportsTable from "./SalesReportsTable";
import { reportService } from "../../../services/reportService";

const PurchaseReportCom = () => {
  const [filteredData, setFilteredData] = useState([]);
  const [amountData, setAmountData] = useState([]);

  useEffect(() => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    fetchPurchaseLog(yesterday.getTime(), today.getTime());
    fetchAmount({ fromDate: yesterday.getTime(), toDate: today.getTime() });
  }, []);

  const fetchPurchaseLog = (dateFrom, dateTo) => {
    reportService.getPurchaseLog({ fromDate: dateFrom, toDate: dateTo })
      .then(res => {
        console.log(res)
        setFilteredData(res.data?.data?.docs);
      })
      .catch(e => console.log("Failed to get pruchaselog: ", e))
  }

  const fetchPurchaseLogsWithFilter = ({ fromDate, toDate, vendors, stores }) => {
    reportService.getPurchaseLog({ fromDate, toDate, stores, vendors })
      .then(res => {
        console.log(res)
        setFilteredData(res.data?.data?.docs);
      })
      .catch(e => console.log("Failed to get pruchaselog: ", e))
  }

  const fetchAmount = (dateFrom, dateTo) => {
    reportService.getAmount(dateFrom, dateTo)
      .then(res => {
        console.log(res)
        setAmountData(res.data?.data?.docs);
      })
      .catch(e => console.log("Failed to get amount: ", e))
  }

  const fetchAmountWithFilter = ({ fromDate, toDate, vendors, stores }) => {
    reportService.getAmount({ fromDate, toDate, stores, vendors })
      .then(res => {
        console.log(res)
        setAmountData(res.data?.data?.docs);
      })
      .catch(e => console.log("Failed to get pruchaselog: ", e))
  }

  const handleFormSubmit = (values) => {
    if (values) {
      const { from, to, vendor = [], store = [] } = values;

      const fromTimestamp = new Date(from).getTime();
      const toTimestamp = new Date(to).getTime();

      const vendorIds = vendor.map(v => v.value);
      const storeIds = store.map(s => s.value);

      if (vendorIds.length || storeIds.length) {
        fetchPurchaseLogsWithFilter({
          fromDate: fromTimestamp,
          toDate: toTimestamp,
          vendors: vendorIds,
          stores: storeIds,
        });
        fetchAmountWithFilter({
          fromDate: fromTimestamp,
          toDate: toTimestamp,
          vendors: vendorIds,
          stores: storeIds,
        });
      }
      else {
        fetchPurchaseLog(fromTimestamp, toTimestamp);
        fetchAmount({ fromDate: fromTimestamp, toDate: toTimestamp });
      }
    }
  };

  return (
    <div className="max-width-95 mx-auto px-4 py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-11">
          <div>
            <h1 className="h2 text-dark fw-bold">Purchase Report</h1>
          </div>
          <div className=" mt-5">
            <PurchaseReportsForm onSubmit={handleFormSubmit} />
          </div>
          <div className="card shadow-none border p-0 mt-5">
            <h6 className="fw-bold px-3 pt-3">Purchase Report</h6>
            <PurchaseReportsTable data={filteredData} amountData={amountData[0]?.totalAmount} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseReportCom;
