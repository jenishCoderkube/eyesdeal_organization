import React, { useState, useMemo, useEffect } from "react";
import GstReportsForm from "./GstReportsForm";
import GstReportsTable from "./GstReportsTable";
import { reportService } from "../../../services/reportService";

const GstReportCom = () => {
  const [filteredData, setFilteredData] = useState([]);
  const [storesIdsData, setStoresIdsData] = useState([]);

  useEffect(() => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    fetchOrders({ fromDate: yesterday.getTime(), toDate: today.getTime(), page: 1 });
  }, []);

  const fetchOrders = ({ fromDate, toDate, page }) => {
    const payload = {
      fromDate,
      toDate,
      ...(page && { page }),
    };
    reportService.fetchOrders(payload)
      .then(res => {
        setFilteredData(res.data?.data?.docs);
      })
      .catch(e => console.log("Failed to get orders: ", e))
  }

  const fetchOrdersWithFilter = ({ fromDate, toDate, stores }) => {
    reportService.fetchOrders({ fromDate, toDate, stores })
      .then(res => {
        setFilteredData(res.data?.data?.docs);
      })
      .catch(e => console.log("Failed to get orders: ", e))
  }

  const handleFormSubmit = (values) => {
    const { from, to, brands = [], store = [] } = values;

    const fromTimestamp = new Date(from).getTime();
    const toTimestamp = new Date(to).getTime();

    const storeIds = store.map(s => s.value);

    if (storeIds.length) {
      fetchOrdersWithFilter({
        fromDate: fromTimestamp,
        toDate: toTimestamp,
        stores: storeIds,
      });
    }
    else {
      fetchOrders({ fromDate: fromTimestamp, toDate: toTimestamp });
    }
  };

  return (
    <div className="max-width-95 mx-auto px-4 py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-11">
          <div>
            <h1 className="h2 text-dark fw-bold">Gst Report</h1>
          </div>
          <div className=" mt-5">
            <GstReportsForm onSubmit={handleFormSubmit} data={filteredData} setStoresIdsData={setStoresIdsData} />
          </div>
          <div className="card shadow-none border p-0 mt-5">
            <h6 className="fw-bold px-3 pt-3">Gst Report</h6>
            <GstReportsTable data={filteredData} storesIdsData={storesIdsData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GstReportCom;
