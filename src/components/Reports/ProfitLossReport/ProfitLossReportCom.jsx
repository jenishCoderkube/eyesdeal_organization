import React, { useState, useEffect } from "react";
import ProfitLossReportsForm from "./ProfitLossReportsForm";
import ProfitLossReportsTable from "./ProfitLossReportsTable";
import { reportService } from "../../../services/reportService";

const ProfitLossReportCom = () => {
  const [filteredData, setFilteredData] = useState([]);
  const [amountData, setAmountData] = useState([]);

  useEffect(() => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    fetchOrders({ fromDate: yesterday.getTime(), toDate: today.getTime(), page: 1 });
    fetchAmount({ fromDate: yesterday.getTime(), toDate: today.getTime(), page: 1 });
  }, []);

  const fetchOrders = ({ fromDate, toDate, page }) => {
    reportService.fetchOrders({ fromDate, toDate, page })
      .then(res => {
        setFilteredData(res.data?.data?.docs);
      })
      .catch(e => console.log("Failed to get orders: ", e))
  }

  const fetchOrdersWithFilter = ({ fromDate, toDate, brands, stores }) => {
    reportService.fetchOrders({ fromDate, toDate, brands, stores })
      .then(res => {
        setFilteredData(res.data?.data?.docs);
      })
      .catch(e => console.log("Failed to get orders: ", e))
  }

  const fetchAmount = ({ fromDate, toDate, page }) => {
    reportService.getAmount({ fromDate, toDate, page })
      .then(res => {
        setAmountData(res.data?.data?.docs);
      })
      .catch(e => console.log("Failed to get amount: ", e))
  }

  const fetchAmountWithFilter = ({ fromDate, toDate, brands, stores }) => {
    reportService.getAmount({ fromDate, toDate, brands, stores })
      .then(res => {
        setAmountData(res.data?.data?.docs);
      })
      .catch(e => console.log("Failed to get orders: ", e))
  }

  const handleFormSubmit = (values) => {
    const { from, to, brands = [], store = [] } = values;

    const fromTimestamp = new Date(from).getTime();
    const toTimestamp = new Date(to).getTime();

    const brandIds = brands.map(b => b.value);
    const storeIds = store.map(s => s.value);
    
    if (brandIds.length || storeIds.length) {
      fetchOrdersWithFilter({
        fromDate: fromTimestamp,
        toDate: toTimestamp,
        brands: brandIds,
        stores: storeIds,
      });
      fetchAmountWithFilter({
        fromDate: fromTimestamp,
        toDate: toTimestamp,
        brands: brandIds,
        stores: storeIds,
      });
    }
    else{
      fetchOrders({ fromDate: fromTimestamp, toDate: toTimestamp, page: 1 });
      fetchAmount({ fromDate: fromTimestamp, toDate: toTimestamp, page: 1 });
    }
  };

  return (
    <div className="max-width-95 mx-auto px-4 py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-11">
          <div>
            <h1 className="h2 text-dark fw-bold">Profit Loss Report</h1>
          </div>
          <div className="mt-5">
            <ProfitLossReportsForm
              onSubmit={handleFormSubmit}
              data={filteredData}
            />
          </div>
          <div className="card shadow-none border p-0 mt-5">
            <h6 className="fw-bold px-3 pt-3">Profit Loss Report</h6>
            <ProfitLossReportsTable data={filteredData} amountData={amountData?.[0]} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfitLossReportCom;
