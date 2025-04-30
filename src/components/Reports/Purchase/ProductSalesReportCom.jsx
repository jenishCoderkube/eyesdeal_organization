import React, { useState, useMemo, useEffect } from "react";
import PurchaseReportsForm from "./SalesReportsForm";
import PurchaseReportsTable from "./SalesReportsTable";
import { reportService } from "../../../services/reportService";

const PurchaseReportCom = () => {

  const [filteredData, setFilteredData] = useState([]);
  const [amountData, setAmountData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    // Get yesterday's date
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    fetchPurchaseLog(yesterday.getTime(), today.getTime());
    fetchAmount(yesterday.getTime(), today.getTime());
  }, []);

  const fetchPurchaseLog = (dateFrom, dateTo) => {
    reportService.getPurchaseLog(dateFrom, dateTo)
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

  const handleFormSubmit = (values) => {
    // console.log(values)
    // const filtered = initialData.filter((item) => {
    //   const itemDate = new Date(item.date.split("/").reverse().join("-"));
    //   const fromDate = values.from;
    //   const toDate = values.to;
    //   return (
    //     (!values.store || item.store === values.store.value) &&
    //     (!values.vendor || item.vendor === values.vendor.value) &&
    //     (!fromDate || itemDate >= fromDate) &&
    //     (!toDate || itemDate <= toDate)
    //   );
    // });
    // setFilteredData(filtered);
    if (values) {
      console.log(values);
      
      const { from, to, page = 1 } = values;

      const fromTimestamp = new Date(from).getTime();
      const toTimestamp = new Date(to).getTime();

      fetchPurchaseLog(fromTimestamp, toTimestamp);
      fetchAmount(fromTimestamp, toTimestamp);
      setCurrentPage(page);
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
