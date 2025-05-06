import React, { useState } from "react";
import StockAdjustmentReportsForm from "./StockAdjustmentReportsForm";
import StockAdjustmentReportsTable from "./StockAdjustmentReportsTable";
import { reportService } from "../../../services/reportService";

const StockAdjustmentReportCom = () => {
  const [filteredData, setFilteredData] = useState([]);
  const [storeidsData, setStoresIdsData] = useState([]);

  const fetchStockReportWithFilter = ({ fromDate, toDate, stores }) => {
    reportService.getStockReport({ fromDate, toDate, stores })
      .then(res => {
        setFilteredData(res.data?.data?.docs);
      })
      .catch(e => console.log("Failed to get pruchaselog: ", e))
  }

  const handleFormSubmit = (values) => {
    const { from, to, store = [] } = values;

    const fromTimestamp = new Date(from).getTime();
    const toTimestamp = new Date(to).getTime();

    const storeIds = store.map(s => s.value);

    if (storeIds.length) {
      fetchStockReportWithFilter({
        fromDate: fromTimestamp,
        toDate: toTimestamp,
        stores: storeIds,
      });
    }
    else{
      fetchStockReportWithFilter({
        fromDate: fromTimestamp,
        toDate: toTimestamp,
      });
    }
  };

  return (
    <div className="max-width-95 mx-auto px-4 py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-11">
          <div>
            <h1 className="h2 text-dark fw-bold">Stock Adjustment Report</h1>
          </div>
          <div className=" mt-5">
            <StockAdjustmentReportsForm
              onSubmit={handleFormSubmit}
              data={filteredData}
              setFilteredData={setFilteredData}
              setStoresIdsData= {setStoresIdsData}
            />
          </div>
          <div className="card shadow-none border p-0 mt-5">
            <h6 className="fw-bold px-3 pt-3">Adjustment Report</h6>
            <StockAdjustmentReportsTable data={filteredData} storeidsData={storeidsData}/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockAdjustmentReportCom;
